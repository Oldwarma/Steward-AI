import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(request: NextRequest) {
  try {
    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        { error: "YouTube API key not configured" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "AI artificial intelligence technology product";
    const maxResults = parseInt(searchParams.get("maxResults") || "20");

    // 计算最近一个月的日期（ISO 8601 格式）
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const publishedAfter = oneMonthAgo.toISOString();

    // YouTube Data API v3 - Search
    // 排除搞笑、娱乐类视频，专注于 AI 技术和产品
    const searchQuery = `${query} -funny -comedy -entertainment -prank -meme`;
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", searchQuery);
    url.searchParams.set("type", "video");
    url.searchParams.set("order", "viewCount"); // 按观看量排序
    url.searchParams.set("publishedAfter", publishedAfter); // 只获取最近一个月的内容
    url.searchParams.set("maxResults", (maxResults * 2).toString()); // 获取更多结果以便过滤
    url.searchParams.set("key", YOUTUBE_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      console.error("YouTube API error:", data);
      return NextResponse.json(
        { error: "YouTube API request failed", details: data },
        { status: response.status }
      );
    }

    // 获取视频 ID 列表，用于获取详细统计信息
    const videoIds = (data.items || [])
      .map((item: any) => item.id.videoId)
      .join(",");

    // 获取视频详细统计信息（观看量、点赞数等）
    let videoStats: Record<string, any> = {};
    if (videoIds) {
      try {
        const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
        statsUrl.searchParams.set("part", "statistics,snippet,contentDetails");
        statsUrl.searchParams.set("id", videoIds);
        statsUrl.searchParams.set("key", YOUTUBE_API_KEY);

        const statsResponse = await fetch(statsUrl.toString());
        const statsData = await statsResponse.json();

        if (statsResponse.ok && statsData.items) {
          statsData.items.forEach((item: any) => {
            videoStats[item.id] = {
              viewCount: parseInt(item.statistics?.viewCount || "0"),
              likeCount: parseInt(item.statistics?.likeCount || "0"),
              commentCount: parseInt(item.statistics?.commentCount || "0"),
              duration: item.contentDetails?.duration,
            };
          });
        }
      } catch (error) {
        console.error("Failed to fetch video stats:", error);
      }
    }

    // 过滤关键词：排除搞笑、娱乐类视频
    const excludeKeywords = [
      "funny", "comedy", "prank", "meme", "joke", "laugh", "hilarious",
      "搞笑", "喜剧", "恶搞", "整蛊", "段子", "笑话"
    ];
    
    // AI 相关关键词：确保内容与 AI 技术或产品相关
    const aiKeywords = [
      "AI", "artificial intelligence", "machine learning", "ML", "deep learning",
      "neural network", "GPT", "LLM", "ChatGPT", "OpenAI", "Claude", "Gemini",
      "AI product", "AI tool", "AI model", "AI technology", "AI research",
      "人工智能", "机器学习", "深度学习", "神经网络", "AI产品", "AI工具"
    ];

    // 格式化并过滤返回数据
    const allVideos = (data.items || []).map((item: any) => {
      const stats = videoStats[item.id.videoId] || {};
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        thumbnails: item.snippet.thumbnails,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        channelUrl: `https://www.youtube.com/channel/${item.snippet.channelId}`,
        viewCount: stats.viewCount || 0,
        likeCount: stats.likeCount || 0,
        commentCount: stats.commentCount || 0,
        duration: stats.duration || "",
      };
    });

    // 过滤视频：排除搞笑类，只保留 AI 相关，并且只保留最近一个月的内容
    // 使用之前定义的 oneMonthAgo 变量
    const filteredVideos = allVideos.filter((video: any) => {
      // 检查发布日期是否在最近一个月内
      const publishedDate = new Date(video.publishedAt);
      if (publishedDate < oneMonthAgo) {
        return false;
      }

      const titleLower = video.title.toLowerCase();
      const descLower = (video.description || "").toLowerCase();
      const combinedText = `${titleLower} ${descLower}`;

      // 检查是否包含排除关键词
      const hasExcludeKeyword = excludeKeywords.some(keyword => 
        combinedText.includes(keyword.toLowerCase())
      );
      if (hasExcludeKeyword) {
        return false;
      }

      // 检查是否包含 AI 相关关键词
      const hasAiKeyword = aiKeywords.some(keyword => 
        combinedText.includes(keyword.toLowerCase())
      );
      return hasAiKeyword;
    });

    // 去重：确保没有重复的 ID（虽然 YouTube 视频 ID 应该是唯一的，但为了保险起见）
    const uniqueVideosMap = new Map<string, any>();
    filteredVideos.forEach((video: any) => {
      if (!uniqueVideosMap.has(video.id)) {
        uniqueVideosMap.set(video.id, video);
      }
    });

    // 限制返回数量
    const videos = Array.from(uniqueVideosMap.values()).slice(0, maxResults);

    return NextResponse.json({
      videos,
      totalResults: videos.length,
    });
  } catch (error) {
    console.error("YouTube API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube data", details: String(error) },
      { status: 500 }
    );
  }
}
