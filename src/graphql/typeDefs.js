import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String

    githubConnected: Boolean!
    leetcodeConnected: Boolean!

    commitsToday: Int
    leetcodeSolved: LeetcodeStats

    habits: [Habit!]!
    courseProgress: [CourseProgress!]!
    skillRecommendations: [String!]!
  }

  type LeetcodeStats {
    total: Int!
    easy: Int!
    medium: Int!
    hard: Int!
  }

  type Habit {
    id: ID!
    name: String!
    targetFrequency: Int!
    currentStreak: Int!
    completedToday: Boolean!
  }

  type CourseProgress {
    id: ID!
    courseName: String!
    lessonName: String!
    completedAt: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    connectGithub(username: String!, accessToken: String!): User!
    connectLeetcode(username: String!): User!
    completeHabit(habitId: ID!): Habit!
    createHabit(name: String!, targetFrequency: Int!): Habit!
    deleteHabit(habitId: ID!): Boolean!
    completeLesson(courseName: String!, lessonName: String!): CourseProgress!
  }
`;