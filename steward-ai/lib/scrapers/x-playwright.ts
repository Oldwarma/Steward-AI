import { chromium, Browser, Page } from "playwright";

export interface ScrapedXPost {
  platform: "x";
  postId: string;
  author: string;
  content: string;
  url: string;
  likeCount: number;
  repostCount: number;
  publishTime: Date;
  keyword: string;
}

interface ScrapeOptions {
  keyword: string;
  maxItems?: number;
}

/**
 * 使用 Playwright 抓取 X（Twitter）搜索结果页面的推文。
 *
 * 风控 / 稳定性策略：
 * - 使用真实 User-Agent（桌面浏览器 UA）
 * - 使用 storageState 复用登录态，避免频繁登录
 * - 页面完全加载后再开始解析 DOM
 * - 通过滚轮滚动逐步加载内容，每次滚动后随机等待 2–5 秒
 * - 最多抓取 maxItems（默认 30）条推文，并在内存中去重
 * - 所有 Playwright 调用都有 try/catch，失败时会优雅降级并关闭浏览器
 */
export async function scrapeXPosts(options: ScrapeOptions): Promise<ScrapedXPost[]> {
  const { keyword, maxItems = 30 } = options;

  let browser: Browser | null = null;
  let page: Page | null = null;

  // 为了安全，始终在函数内部维护一个去重 Map，key 为 tweetId
  const postsMap = new Map<string, ScrapedXPost>();

  try {
    // 使用桌面 Chrome 的常见 UA
    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/120.0.0.0 Safari/537.36";

    /**
     * storageState 用于复用登录态：
     * - 请在本地使用 Playwright CLI 先登录一次 X，并导出 storageState 文件，例如：
     *
     *   npx playwright codegen https://x.com --save-storage=storage/x-auth.json
     *
     * - 然后在项目根目录创建 storage/x-auth.json，并确保不提交到 Git（加入 .gitignore）
     */
    const storageStatePath = "storage/x-auth.json";

    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      userAgent,
      storageState: storageStatePath,
    });

    page = await context.newPage();

    const searchUrl = `https://x.com/search?q=${encodeURIComponent(
      keyword,
    )}&src=typed_query&f=live`;

    await page.goto(searchUrl, {
      waitUntil: "networkidle",
      timeout: 60_000,
    });

    // 页面加载后再开始解析，先额外等一会
    await page.waitForTimeout(3_000);

    // 滚动加载，直到获取到足够的推文或者达到最大滚动次数
    const maxScrollTimes = 10;

    for (let i = 0; i < maxScrollTimes; i++) {
      // 解析当前已加载的推文
      const newPosts = await extractPostsFromPage(page, keyword);
      newPosts.forEach((post) => {
        if (!postsMap.has(post.postId) && postsMap.size < maxItems) {
          postsMap.set(post.postId, post);
        }
      });

      if (postsMap.size >= maxItems) {
        break;
      }

      // 继续向下滚动加载更多内容
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 0.8);
      });

      // 随机等待 2–5 秒，模拟真实用户行为
      const waitMs = 2_000 + Math.random() * 3_000;
      await page.waitForTimeout(waitMs);
    }

    return Array.from(postsMap.values());
  } catch (error) {
    console.error("[X Scraper] Failed to scrape X posts:", error);
    // 抓取失败时返回空数组，不能影响 Web 服务
    return [];
  } finally {
    try {
      if (page) await page.close();
    } catch {
      // ignore
    }
    try {
      if (browser) await browser.close();
    } catch {
      // ignore
    }
  }
}

/**
 * 在当前页面 DOM 中解析推文列表。
 *
 * 说明：
 * - X 前端结构变化较频繁，这里使用相对稳妥的选择器组合：
 *   - article 元素代表一条推文
 *   - data-testid="tweet" / "cellInnerDiv" 等属性作为辅助
 * - 如果后续 X DOM 发生变化，只需要在这里调整选择器即可，API Route 无需改动
 */
async function extractPostsFromPage(page: Page, keyword: string): Promise<ScrapedXPost[]> {
  // 在浏览器上下文中执行 DOM 解析
  const raw = await page.evaluate(() => {
    const articles = Array.from(document.querySelectorAll<HTMLElement>("article"));

    return articles.map((article) => {
      try {
        // 推文链接 & ID
        const anchor = article.querySelector<HTMLAnchorElement>('a[href*="/status/"]');
        const href = anchor?.getAttribute("href") ?? "";

        // /{username}/status/{id}
        const match = href.match(/^\/([^/]+)\/status\/(\d+)/);
        const username = match?.[1] ?? "";
        const tweetId = match?.[2] ?? "";

        // 文本内容
        const textSpans = article.querySelectorAll<HTMLElement>("div[dir='auto']");
        const content = Array.from(textSpans)
          .map((el) => el.innerText.trim())
          .filter(Boolean)
          .join("\n");

        // 作者名（通常是第一个 strong 或 span[dir='auto']）
        const authorEl =
          article.querySelector("div[dir='ltr'] span") ||
          article.querySelector("div[dir='auto'] span");
        const author = authorEl?.textContent?.trim() ?? username;

        // 发布时间（可能在 time 标签中）
        const timeEl = article.querySelector("time");
        const datetime = timeEl?.getAttribute("datetime") ?? "";

        // 点赞 / 转发数（带 aria-label 的按钮）
        const actionButtons = Array.from(
          article.querySelectorAll<HTMLElement>('button[aria-label]'),
        );
        let likeCount = 0;
        let repostCount = 0;

        for (const btn of actionButtons) {
          const label = btn.getAttribute("aria-label") ?? "";
          const numMatch = label.match(/(\d[\d,]*)/);
          const num = numMatch ? parseInt(numMatch[1].replace(/,/g, ""), 10) : 0;

          if (/Like/i.test(label)) {
            likeCount = num;
          } else if (/Repost|Retweet/i.test(label)) {
            repostCount = num;
          }
        }

        return {
          tweetId,
          username,
          content,
          author,
          datetime,
          likeCount,
          repostCount,
          href,
        };
      } catch (e) {
        console.error("Error parsing tweet article", e);
        return null;
      }
    });
  });

  const posts: ScrapedXPost[] = [];

  for (const item of raw) {
    if (!item || !item.tweetId) continue;

    const url = item.href
      ? `https://x.com${item.href}`
      : item.username && item.tweetId
        ? `https://x.com/${item.username}/status/${item.tweetId}`
        : "";

    const publishTime = item.datetime ? new Date(item.datetime) : new Date();

    posts.push({
      platform: "x",
      postId: item.tweetId,
      author: item.author || item.username || "Unknown",
      content: item.content || "",
      url,
      likeCount: item.likeCount ?? 0,
      repostCount: item.repostCount ?? 0,
      publishTime,
      keyword,
    });
  }

  return posts;
}

