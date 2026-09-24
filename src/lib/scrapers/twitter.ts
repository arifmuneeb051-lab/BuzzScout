export interface TweetPost {
  id: string;
  text: string;
  author: string;
  authorUsername: string;
  url: string;
  createdAt: string;
}

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days maximum age

export async function searchTwitter(query: string): Promise<TweetPost[]> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (bearerToken) {
    try {
      const encodedQuery = encodeURIComponent(`${query} -is:retweet lang:en`);
      const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodedQuery}&tweet.fields=created_at,author_id&expansions=author_id&user.fields=username,name&max_results=15`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const tweets = data.data || [];
        const usersMap = new Map<string, any>();
        (data.includes?.users || []).forEach((u: any) => usersMap.set(u.id, u));

        const now = Date.now();
        const validTweets: TweetPost[] = [];

        for (const t of tweets) {
          const tDate = new Date(t.created_at).getTime();
          
          // Strict filtering: discard old tweets
          if (isNaN(tDate) || now - tDate > MAX_AGE_MS) continue;

          const user = usersMap.get(t.author_id);
          const username = user?.username || "unknown";
          
          validTweets.push({
            id: t.id,
            text: t.text,
            author: user?.name || username,
            authorUsername: username,
            url: `https://x.com/${username}/status/${t.id}`,
            createdAt: t.created_at,
          });
        }
        
        return validTweets;
      }
    } catch (err) {
      console.warn("Failed querying Twitter API v2:", err);
    }
  }

  // Strictly return empty array if no real data is fetched
  return [];
}
