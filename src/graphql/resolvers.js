import { getCommitsToday } from "../services/github.js";
import { getLeetcodeStats } from "../services/leetcode.js";
import { getSkillRecommendations } from "../services/skillRecommendations.js";

export const resolvers = {
  User: {
    githubConnected: (user) => Boolean(user.githubUsername),
    leetcodeConnected: (user) => Boolean(user.leetcodeUsername),

    commitsToday: async (user) => {
      if (!user.githubUsername || !user.githubAccessToken) return null;
      return getCommitsToday(user.githubUsername, user.githubAccessToken);
    },

    leetcodeSolved: async (user) => {
      if (!user.leetcodeUsername) return null;
      return getLeetcodeStats(user.leetcodeUsername);
    },

    habits: async (user, _args, { prisma }) => {
      const habits = await prisma.habit.findMany({
        where: { userId: user.id },
        include: { completions: { orderBy: { completedAt: "desc" } } },
      });

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      return habits.map((h) => ({
        id: h.id,
        name: h.name,
        targetFrequency: h.targetFrequency,
        completedToday: h.completions.some((c) => c.completedAt >= startOfToday),
        currentStreak: computeStreak(h.completions.map((c) => c.completedAt)),
      }));
    },

    courseProgress: (user, _args, { prisma }) =>
      prisma.courseProgress.findMany({ where: { userId: user.id } }),

    skillRecommendations: async (user, _args, ctx) => {
      const [commitsToday, leetcodeStats, courseProgress] = await Promise.all([
        resolvers.User.commitsToday(user),
        resolvers.User.leetcodeSolved(user),
        resolvers.User.courseProgress(user, _args, ctx),
      ]);
      const habits = await resolvers.User.habits(user, _args, ctx);

      return getSkillRecommendations({ commitsToday, leetcodeStats, habits, courseProgress });
    },
  },

  Query: {
    me: (_parent, _args, { user }) => user,
  },

  Mutation: {
    connectGithub: (_parent, { username, accessToken }, { user, prisma }) =>
      prisma.user.update({
        where: { id: user.id },
        data: { githubUsername: username, githubAccessToken: accessToken },
      }),

    connectLeetcode: (_parent, { username }, { user, prisma }) =>
      prisma.user.update({
        where: { id: user.id },
        data: { leetcodeUsername: username },
      }),

    createHabit: (_parent, { name, targetFrequency }, { user, prisma }) =>
      prisma.habit.create({ data: { userId: user.id, name, targetFrequency } }),

completeHabit: async (_parent, { habitId }, { prisma, user }) => {

  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      userId: user.id
    }
  });

  if (!habit) {
    throw new Error("Habit not found");
  }

  await prisma.habitCompletion.create({
    data: {
      habitId: habit.id
    }
  });

  const updatedHabit = await prisma.habit.findFirst({
    where: {
      id: habit.id,
      userId: user.id
    },
    include: {
      completions: {
        orderBy: {
          completedAt: "desc"
        }
      }
    }
  });

  return {
    id: updatedHabit.id,
    name: updatedHabit.name,
    targetFrequency: updatedHabit.targetFrequency,
    completedToday: true,
    currentStreak: computeStreak(
      updatedHabit.completions.map(c => c.completedAt)
    )
  };
},



    completeLesson: (_parent, { courseName, lessonName }, { user, prisma }) =>
      prisma.courseProgress.create({
        data: { userId: user.id, courseName, lessonName },
      }),
  },
};

function computeStreak(datesDesc) {
  if (datesDesc.length === 0) return 0;
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const date of datesDesc) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === cursor.getTime()) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (d.getTime() < cursor.getTime()) {
      break;
    }
  }
  return streak;
}