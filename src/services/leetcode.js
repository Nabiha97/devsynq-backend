import axios from "axios";

const LEETCODE_ENDPOINT = "https://leetcode.com/graphql";

const QUERY = `
  query getUserStats($username: String!) {
    matchedUser(username: $username) {
      submitStats: submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
    }
  }
`;

export async function getLeetcodeStats(username) {
  try {
    const res = await axios.post(
      LEETCODE_ENDPOINT,
      { query: QUERY, variables: { username } },
      { headers: { "Content-Type": "application/json" } }
    );

    const counts = res.data?.data?.matchedUser?.submitStats?.acSubmissionNum;
    if (!counts) return null;

    const find = (d) => counts.find((c) => c.difficulty === d)?.count ?? 0;
    return { total: find("All"), easy: find("Easy"), medium: find("Medium"), hard: find("Hard") };
  } catch (err) {
    console.error("LeetCode fetch failed:", err.message);
    return null;
  }
}