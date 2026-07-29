import axios from "axios";

export async function getCommitsToday(username, accessToken) {
  const today = new Date().toISOString().split("T")[0];

  const res = await axios.get("https://api.github.com/search/commits", {
    params: { q: `author:${username} author-date:>=${today}` },
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.cloak-preview+json",
    },
  });

  return res.data.total_count;
}