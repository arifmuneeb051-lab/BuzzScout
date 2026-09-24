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

const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 Days maximum age

export async function searchReddit(query: string, subreddit?: string | null): Promise<RedditPost[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    let targetUrl: string;

    if (subreddit && subreddit.trim().length > 0) {
      const cleanSub = subreddit.trim().replace(/^r\//, "");
      targetUrl = `https://www.reddit.com/r/${cleanSub}/search.json?q=${encodedQuery}&restrict_sr=1&sort=new&limit=25`;
    } else {
      targetUrl = `https://www.reddit.com/search.json?q=${encodedQuery}&sort=new&limit=25`;
    }

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "web:buzzscout-radar-engine:v2.0.0 (by /u/buzzscout_bot)",
        "Accept": "application/json",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.warn(`Reddit JSON fetch status ${res.status}, falling back to RSS feed...`);
      return await searchRedditRss(query, subreddit);
    }

    const data = await res.json();
    const children = data?.data?.children || [];
    
    const now = Math.floor(Date.now() / 1000);

    const posts: RedditPost[] = [];
    
    for (const item of children) {
      const p = item.data;
      if (!p || !p.created_utc) continue;
      
      // Strict filtering: discard old posts (older than 7 days)
      if (now - p.created_utc > MAX_AGE_SECONDS) continue;
      
      // Skip deleted or empty authors
      if (p.author === "[deleted]" || !p.author) continue;

      posts.push({
        id: p.id,
        title: p.title || "",
        selftext: p.selftext || "",
        author: p.author,
        permalink: p.permalink ? `https://reddit.com${p.permalink}` : "",
        url: p.permalink ? `https://reddit.com${p.permalink}` : p.url || "",
        subreddit: p.subreddit || "",
        createdUtc: p.created_utc,
        score: p.score || 1,
        numComments: p.num_comments || 0,
      });
    }

    if (posts.length === 0) {
      return await searchRedditRss(query, subreddit);
    }

    return posts;
  } catch (err) {
    console.warn(`Reddit JSON failed for "${query}", trying RSS:`, err);
    return await searchRedditRss(query, subreddit);
  }
}

async function searchRedditRss(query: string, subreddit?: string | null): Promise<RedditPost[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = subreddit && subreddit.trim().length > 0
      ? `https://www.reddit.com/r/${subreddit.trim().replace(/^r\//, "")}/search.rss?q=${encoded}&sort=new&restrict_sr=1`
      : `https://www.reddit.com/search.rss?q=${encoded}&sort=new`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return []; // Return empty array instead of fake data
    }

    const xmlText = await res.text();
    const entries: RedditPost[] = [];
    
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    let match;
    const now = Math.floor(Date.now() / 1000);

    while ((match = entryRegex.exec(xmlText)) !== null && entries.length < 15) {
      const block = match[1];
      const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(block);
      const linkMatch = /<link[^>]+href="([^"]+)"/i.exec(block);
      const authorMatch = /<author>[\s\S]*?<name>([^<]+)<\/name>/i.exec(block);
      const contentMatch = /<content[^>]*>([\s\S]*?)<\/content>/i.exec(block);
      const idMatch = /<id>([^<]+)<\/id>/i.exec(block);
      const updatedMatch = /<updated>([^<]+)<\/updated>/i.exec(block);

      const title = (titleMatch ? titleMatch[1] : "").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
      const permalink = linkMatch ? linkMatch[1] : "";
      const author = authorMatch ? authorMatch[1].replace(/^\/u\//, "") : "";
      const id = idMatch ? idMatch[1].split("/").pop() || "" : "";
      
      let createdUtc = now;
      if (updatedMatch) {
        const d = new Date(updatedMatch[1]);
        if (!isNaN(d.getTime())) {
          createdUtc = Math.floor(d.getTime() / 1000);
        }
      }

      // Strict filtering: 7 days max age and skip missing critical info
      if (now - createdUtc > MAX_AGE_SECONDS) continue;
      if (!id || !author || author === "[deleted]") continue;

      let text = (contentMatch ? contentMatch[1] : "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();

      if (title.length > 5) {
        entries.push({
          id,
          title,
          selftext: text.slice(0, 300),
          author,
          permalink,
          url: permalink,
          subreddit: subreddit || "",
          createdUtc,
          score: 1, // RSS doesn't reliably provide score
          numComments: 0,
        });
      }
    }

    return entries; // Return parsed real data or empty array
  } catch (err) {
    console.warn("RSS parser error:", err);
    return []; // Return empty array on error
  }
}
