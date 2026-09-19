export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  permalink: string;
  url: string;
  subreddit: string;
  createdUtc: number;
  score: number;
  numComments: number;
}

export async function searchReddit(query: string, subreddit?: string | null): Promise<RedditPost[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    let targetUrl: string;

    if (subreddit && subreddit.trim().length > 0) {
      const cleanSub = subreddit.trim().replace(/^r\//, "");
      targetUrl = `https://www.reddit.com/r/${cleanSub}/search.json?q=${encodedQuery}&restrict_sr=1&sort=new&limit=20`;
    } else {
      targetUrl = `https://www.reddit.com/search.json?q=${encodedQuery}&sort=new&limit=25`;
    }

    const res = await fetch(targetUrl, {
      headers: {
        // Reddit requires a descriptive User-Agent to prevent 429
        "User-Agent": "web:signalpulse-radar-saas:v1.0.0 (by /u/signalpulse_bot)",
        "Accept": "application/json",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.warn(`Reddit fetch responded with status ${res.status} for query "${query}"`);
      return [];
    }

    const data = await res.json();
    const children = data?.data?.children || [];

    const posts: RedditPost[] = children.map((item: any) => {
      const p = item.data;
      return {
        id: p.id,
        title: p.title || "",
        selftext: p.selftext || "",
        author: p.author || "[deleted]",
        permalink: p.permalink ? `https://reddit.com${p.permalink}` : "",
        url: p.permalink ? `https://reddit.com${p.permalink}` : p.url || "",
        subreddit: p.subreddit || "",
        createdUtc: p.created_utc || Math.floor(Date.now() / 1000),
        score: p.score || 1,
        numComments: p.num_comments || 0,
      };
    });

    return posts;
  } catch (err) {
    console.error(`Error querying Reddit for query "${query}":`, err);
    return [];
  }
}
