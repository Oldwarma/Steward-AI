"use client";

import {
  Youtube,
  ExternalLink,
  Heart,
  Repeat2,
  MessageCircle,
  RefreshCw,
  Eye,
  ThumbsUp,
  MessageSquare,
  Calendar,
  User,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

// X (Twitter) 图标组件
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/contexts/i18n-context";
import { useState, useEffect } from "react";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  channelUrl: string;
  publishedAt: string;
  thumbnails: any;
  url: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
}

interface TwitterTweet {
  id: string;
  text: string;
  author: string;
  authorHandle: string;
  createdAt: string;
  likes: number;
  retweets: number;
  replies: number;
  url: string;
}

export default function AnalyticsPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [twitterTweets, setTwitterTweets] = useState<TwitterTweet[]>([]);
  const [loadingYoutube, setLoadingYoutube] = useState(false);
  const [loadingTwitter, setLoadingTwitter] = useState(false);
  const [errorYoutube, setErrorYoutube] = useState<string | null>(null);
  const [errorTwitter, setErrorTwitter] = useState<string | null>(null);
  
  // 从 URL 参数读取平台，默认为 youtube
  const platformParam = searchParams.get("platform");
  const [selectedPlatform, setSelectedPlatform] = useState<"youtube" | "twitter">(
    platformParam === "twitter" ? "twitter" : "youtube"
  );
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [expandedTweetId, setExpandedTweetId] = useState<string | null>(null);

  // 当 URL 参数变化时，更新选中的平台
  useEffect(() => {
    const platform = searchParams.get("platform");
    if (platform === "twitter") {
      setSelectedPlatform("twitter");
    } else {
      // 如果没有参数或参数是 youtube，默认显示 YouTube
      setSelectedPlatform("youtube");
      // 如果 URL 中没有 platform 参数，添加默认参数
      if (!platform) {
        router.replace("/analytics?platform=youtube");
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    // 加载 YouTube 热点（默认加载更多）
    const loadYouTubeHotspots = async () => {
      setLoadingYoutube(true);
      setErrorYoutube(null);
      try {
        const response = await fetch("/api/hotspots/youtube?query=AI artificial intelligence technology product&maxResults=20");
        const data = await response.json();
        if (response.ok) {
          setYoutubeVideos(data.videos || []);
        } else {
          setErrorYoutube(data.error || "Failed to load YouTube data");
        }
      } catch (error) {
        setErrorYoutube("Failed to fetch YouTube hotspots");
      } finally {
        setLoadingYoutube(false);
      }
    };

    // 加载 Twitter 热点（默认加载更多）
    const loadTwitterHotspots = async () => {
      // 不立即清空数据，保持旧数据可见
      setLoadingTwitter(true);
      setErrorTwitter(null);
      try {
        const response = await fetch("/api/hotspots/twitter?query=AI artificial intelligence technology product&maxResults=20");
        const data = await response.json();
        if (response.ok) {
          setTwitterTweets(data.tweets || []);
        } else {
          setErrorTwitter(data.error || "Failed to load Twitter data");
        }
      } catch (error) {
        setErrorTwitter("Failed to fetch Twitter hotspots");
      } finally {
        setLoadingTwitter(false);
      }
    };

    // 初始加载两个平台的数据
    loadYouTubeHotspots();
    loadTwitterHotspots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 刷新当前选中的平台数据
  const refreshCurrentPlatform = async () => {
    if (selectedPlatform === "youtube") {
      setLoadingYoutube(true);
      setErrorYoutube(null);
      try {
        const response = await fetch("/api/hotspots/youtube?query=AI artificial intelligence technology product&maxResults=20");
        const data = await response.json();
        if (response.ok) {
          setYoutubeVideos(data.videos || []);
        } else {
          setErrorYoutube(data.error || "Failed to load YouTube data");
        }
      } catch (error) {
        setErrorYoutube("Failed to fetch YouTube hotspots");
      } finally {
        setLoadingYoutube(false);
      }
    } else {
      // Twitter 刷新时保持旧数据可见
      setLoadingTwitter(true);
      setErrorTwitter(null);
      try {
        const response = await fetch("/api/hotspots/twitter?query=AI artificial intelligence technology product&maxResults=20");
        const data = await response.json();
        if (response.ok) {
          setTwitterTweets(data.tweets || []);
        } else {
          setErrorTwitter(data.error || "Failed to load Twitter data");
        }
      } catch (error) {
        setErrorTwitter("Failed to fetch Twitter hotspots");
      } finally {
        setLoadingTwitter(false);
      }
    }
  };

  // 格式化时长（ISO 8601 格式转换为可读格式）
  const formatDuration = (duration: string) => {
    if (!duration) return "";
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return duration;
    const hours = (match[1] || "").replace("H", "");
    const minutes = (match[2] || "").replace("M", "");
    const seconds = (match[3] || "").replace("S", "");
    const parts = [];
    if (hours) parts.push(`${hours}小时`);
    if (minutes) parts.push(`${minutes}分钟`);
    if (seconds) parts.push(`${seconds}秒`);
    return parts.join(" ") || duration;
  };

  return (
    <div className="flex h-full flex-col gap-6">
        {/* YouTube 热点详情 */}
        {selectedPlatform === "youtube" && (
              <Card className="flex h-full flex-col overflow-hidden">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-red-500" />
                        {t.analytics.youtubeHotspots}
                      </CardTitle>
                      <CardDescription>AI 相关热门视频 - {youtubeVideos.length} 个结果</CardDescription>
                    </div>
                    <button
                      onClick={refreshCurrentPlatform}
                      disabled={loadingYoutube}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${loadingYoutube ? "animate-spin" : ""}`} />
                      {t.analytics.refresh}
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto space-y-4">
                  {loadingYoutube ? (
                    <div className="flex items-center justify-center py-12 text-sm text-[var(--muted)]">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      {t.analytics.loading}
                    </div>
                  ) : errorYoutube ? (
                    <div className="flex items-center justify-center py-12 text-sm text-red-500">
                      {errorYoutube}
                    </div>
                  ) : youtubeVideos.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-sm text-[var(--muted)]">
                      {t.analytics.noData}
                    </div>
                  ) : (
                    youtubeVideos.map((video) => {
                      const isExpanded = expandedVideoId === video.id;
                      return (
                        <div
                          key={video.id}
                          className="rounded-xl border border-[var(--border)] bg-white/5 transition-all hover:bg-white/10 hover:border-[var(--primary)]/50 cursor-pointer"
                          onClick={() => setExpandedVideoId(isExpanded ? null : video.id)}
                        >
                          <div className="p-4">
                            <div className="flex gap-4">
                              {video.thumbnails?.medium?.url && (
                                <a
                                  href={video.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <img
                                    src={video.thumbnails.medium.url}
                                    alt={video.title}
                                    className="h-32 w-48 rounded-lg object-cover"
                                  />
                                </a>
                              )}
                              <div className="flex-1 min-w-0 space-y-3">
                                <div>
                                  <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                                      {video.title}
                                    </h3>
                                  </a>
                                  <div className="flex items-center gap-4 text-xs text-[var(--muted)] mb-2">
                                    <a
                                      href={video.channelUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 hover:text-white transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <User className="h-3 w-3" />
                                      {video.channelTitle}
                                    </a>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(video.publishedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {video.description && (
                                    <p className={`text-sm text-[var(--muted)] mb-3 ${isExpanded ? "" : "line-clamp-2"}`}>
                                      {video.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-6 text-sm flex-wrap">
                                  <div className="flex items-center gap-2 text-[var(--muted)]">
                                    <Eye className="h-4 w-4" />
                                    <span>{video.viewCount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[var(--muted)]">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{video.likeCount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[var(--muted)]">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>{video.commentCount.toLocaleString()}</span>
                                  </div>
                                  {video.duration && (
                                    <div className="text-xs text-[var(--muted)]">
                                      {formatDuration(video.duration)}
                                    </div>
                                  )}
                                  <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-auto flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {t.analytics.watchOnYouTube}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                                {isExpanded && (
                                  <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
                                    <div className="text-xs text-[var(--muted)]">
                                      <strong>视频 ID:</strong> {video.id}
                                    </div>
                                    <div className="text-xs text-[var(--muted)]">
                                      <strong>频道 ID:</strong> {video.channelId}
                                    </div>
                                    <div className="text-xs text-[var(--muted)]">
                                      <strong>发布时间:</strong> {new Date(video.publishedAt).toLocaleString()}
                                    </div>
                                    <a
                                      href={video.channelUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      查看频道
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            )}

        {/* Twitter 热点详情 */}
            {selectedPlatform === "twitter" && (
              <Card className="flex h-full flex-col overflow-hidden">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <XIcon className="h-5 w-5 text-white" />
                        {t.analytics.twitterHotspots}
                      </CardTitle>
                      <CardDescription>AI 相关热门推文 - {twitterTweets.length} 个结果</CardDescription>
                    </div>
                    <button
                      onClick={refreshCurrentPlatform}
                      disabled={loadingTwitter}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${loadingTwitter ? "animate-spin" : ""}`} />
                      {t.analytics.refresh}
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto space-y-4">
                  {loadingTwitter && twitterTweets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3 text-sm text-[var(--muted)]">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <div className="text-center">
                        <div className="font-medium mb-1">正在抓取 Twitter 数据...</div>
                        <div className="text-xs opacity-75">这可能需要 10-30 秒，请稍候</div>
                      </div>
                    </div>
                  ) : loadingTwitter && twitterTweets.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 py-2 text-xs text-[var(--muted)] bg-white/5 rounded-lg">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>正在更新数据...</span>
                      </div>
                      {twitterTweets.map((tweet) => {
                        const isExpanded = expandedTweetId === tweet.id;
                        return (
                          <div
                            key={tweet.id}
                            className="rounded-xl border border-[var(--border)] bg-white/5 transition-all hover:bg-white/10 hover:border-[var(--primary)]/50 cursor-pointer opacity-75"
                            onClick={() => setExpandedTweetId(isExpanded ? null : tweet.id)}
                          >
                            <div className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      <User className="h-4 w-4 text-[var(--muted)]" />
                                      <span className="text-sm font-semibold">{tweet.author}</span>
                                      <span className="text-xs text-[var(--muted)]">
                                        @{tweet.authorHandle}
                                      </span>
                                      <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(tweet.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className={`text-sm text-[var(--foreground)] leading-relaxed mb-3 ${isExpanded ? "" : "line-clamp-3"}`}>
                                      {tweet.text}
                                    </p>
                                  </div>
                                  <a
                                    href={tweet.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 text-xs text-[var(--primary)] hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </div>
                                <div className="flex items-center gap-6 pt-3 border-t border-[var(--border)] flex-wrap">
                                  <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                    <Heart className="h-4 w-4" />
                                    <span className="font-medium">{tweet.likes.toLocaleString()}</span>
                                    <span className="text-xs">{t.analytics.likes}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                    <Repeat2 className="h-4 w-4" />
                                    <span className="font-medium">{tweet.retweets.toLocaleString()}</span>
                                    <span className="text-xs">{t.analytics.retweets}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                    <MessageCircle className="h-4 w-4" />
                                    <span className="font-medium">{tweet.replies.toLocaleString()}</span>
                                    <span className="text-xs">{t.analytics.replies}</span>
                                  </div>
                                  <a
                                    href={tweet.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-auto flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {t.analytics.viewOnTwitter}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                                {isExpanded && (
                                  <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
                                    <div className="text-xs text-[var(--muted)]">
                                      <strong>推文 ID:</strong> {tweet.id}
                                    </div>
                                    <div className="text-xs text-[var(--muted)]">
                                      <strong>作者:</strong> {tweet.author} (@{tweet.authorHandle})
                                    </div>
                                    <div className="text-xs text-[var(--muted)]">
                                      <strong>创建时间:</strong> {new Date(tweet.createdAt).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-[var(--muted)]">
                                      <strong>完整内容:</strong>
                                      <div className="mt-1 p-2 bg-white/5 rounded border border-[var(--border)]">
                                        {tweet.text}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : errorTwitter ? (
                    <div className="flex items-center justify-center py-12 text-sm text-red-500">
                      {errorTwitter}
                    </div>
                  ) : twitterTweets.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-sm text-[var(--muted)]">
                      {t.analytics.noData}
                    </div>
                  ) : (
                    twitterTweets.map((tweet) => {
                      const isExpanded = expandedTweetId === tweet.id;
                      return (
                        <div
                          key={tweet.id}
                          className="rounded-xl border border-[var(--border)] bg-white/5 transition-all hover:bg-white/10 hover:border-[var(--primary)]/50 cursor-pointer"
                          onClick={() => setExpandedTweetId(isExpanded ? null : tweet.id)}
                        >
                          <div className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <User className="h-4 w-4 text-[var(--muted)]" />
                                    <span className="text-sm font-semibold">{tweet.author}</span>
                                    <span className="text-xs text-[var(--muted)]">
                                      @{tweet.authorHandle}
                                    </span>
                                    <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(tweet.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className={`text-sm text-[var(--foreground)] leading-relaxed mb-3 ${isExpanded ? "" : "line-clamp-3"}`}>
                                    {tweet.text}
                                  </p>
                                </div>
                                <a
                                  href={tweet.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0 text-xs text-[var(--primary)] hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                              <div className="flex items-center gap-6 pt-3 border-t border-[var(--border)] flex-wrap">
                                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                  <Heart className="h-4 w-4" />
                                  <span className="font-medium">{tweet.likes.toLocaleString()}</span>
                                  <span className="text-xs">{t.analytics.likes}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                  <Repeat2 className="h-4 w-4" />
                                  <span className="font-medium">{tweet.retweets.toLocaleString()}</span>
                                  <span className="text-xs">{t.analytics.retweets}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                  <MessageCircle className="h-4 w-4" />
                                  <span className="font-medium">{tweet.replies.toLocaleString()}</span>
                                  <span className="text-xs">{t.analytics.replies}</span>
                                </div>
                                <a
                                  href={tweet.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-auto flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {t.analytics.viewOnTwitter}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
                                  <div className="text-xs text-[var(--muted)]">
                                    <strong>推文 ID:</strong> {tweet.id}
                                  </div>
                                  <div className="text-xs text-[var(--muted)]">
                                    <strong>作者:</strong> {tweet.author} (@{tweet.authorHandle})
                                  </div>
                                  <div className="text-xs text-[var(--muted)]">
                                    <strong>创建时间:</strong> {new Date(tweet.createdAt).toLocaleString()}
                                  </div>
                                  <div className="text-xs text-[var(--muted)]">
                                    <strong>完整内容:</strong>
                                    <div className="mt-1 p-2 bg-white/5 rounded border border-[var(--border)]">
                                      {tweet.text}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            )}
    </div>
  );
}

