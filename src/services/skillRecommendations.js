const RULES = [
  {
    needs: ["leetcodeStats"],
    condition: ({ leetcodeStats }) => leetcodeStats.easy > 50 && leetcodeStats.medium < 10,
    suggestion: "You've got a strong Easy base — start pushing into Medium problems.",
  },
  {
    needs: ["leetcodeStats"],
    condition: ({ leetcodeStats }) => leetcodeStats.hard === 0 && leetcodeStats.medium > 30,
    suggestion: "Solid Medium count. Try a few Hard problems to round out your prep.",
  },
  {
    needs: ["commitsToday"],
    condition: ({ commitsToday }) => commitsToday === 0,
    suggestion: "No commits yet today — even a small one keeps your streak alive.",
  },
  {
    needs: ["courseProgress"],
    condition: ({ courseProgress }) =>
      courseProgress.some((c) => c.courseName === "CSS") &&
      !courseProgress.some((c) => c.courseName === "JavaScript"),
    suggestion: "You've covered CSS — JavaScript fundamentals is a natural next step.",
  },
];

export function getSkillRecommendations(userData) {
  return RULES.filter((rule) => rule.needs.every((key) => userData[key] != null))
    .filter((rule) => rule.condition(userData))
    .map((rule) => rule.suggestion);
}