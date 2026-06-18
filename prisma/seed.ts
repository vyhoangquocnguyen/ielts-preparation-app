// prisma/seed.ts
// Seed the database with sample data for testing

import { PrismaClient, UserRole, Plan } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create a sample user that matches the new schema structure
  const sampleUser = await prisma.user.upsert({
    where: { email: "test@example.com" }, // Unique identifier for upsert
    update: {}, // No specific update needed if user already exists
    create: {
      clerkId: "user_test_clerk_id_123", // Dummy Clerk ID, ensure it's unique if you create more users
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      imgUrl: "https://example.com/profile.jpg",
      role: UserRole.STUDENT,
      plan: Plan.FREE,
      targetScore: 7.5,
      studyGoal: "Improve speaking fluency",
      totalStudyTime: 120,
      currentStreak: 5,
      longestStreak: 10,
      lastStudyDate: new Date(),
      listeningAvg: 0,
      readingAvg: 0,
      speakingAvg: 0,
      writingAvg: 0,
      listeningDone: 0,
      readingDone: 0,
      speakingDone: 0,
      writingDone: 0,
    },
  });
  console.log("✅ Created/Updated sample user:", sampleUser.id);

  // Create sample listening exercises
  const listeningExercise = await prisma.listeningExercise.create({
    data: {
      title: "University Lecture - Climate Change",
      description: "An academic lecture about the effects of climate change",
      difficulty: "medium",
      category: "academic",
      audioUrl: "https://example.com/audio/lecture1.mp3",
      duration: 180,
      transcript: "Today we will discuss the impact of climate change on global ecosystems...",
      isPublished: true,
      order: 1,
      questions: {
        create: [
          {
            questionNumber: 1,
            questionType: "multiple_choice",
            questionText: "What is the main topic of the lecture?",
            options: ["Climate change impacts", "Renewable energy", "Ocean pollution", "Wildlife conservation"],
            correctAnswer: "Climate change impacts",
            explanation: "The lecturer clearly states this in the introduction.",
            points: 1,
          },
          {
            questionNumber: 2,
            questionType: "fill_blank",
            questionText: "Rising temperatures have caused _____ to melt rapidly.",
            options: [],
            correctAnswer: "glaciers",
            explanation: "The lecturer mentions glacier melting as a key effect.",
            points: 1,
          },
        ],
      },
    },
  });

  console.log("✅ Created listening exercise:", listeningExercise.id);

  // Create sample reading exercise
  const readingExercise = await prisma.readingExercise.create({
    data: {
      title: "The History of the Internet",
      description: "An academic passage about the development of the internet",
      difficulty: "medium",
      category: "academic",
      passage: `The Internet has revolutionized the way we communicate, work, and access information. 
      Its origins can be traced back to the 1960s when the United States Department of Defense developed ARPANET, a network designed to facilitate communication between research institutions. 
      
      In the 1980s, the development of TCP/IP protocols allowed different networks to connect, 
      forming what we now know as the Internet. The World Wide Web, created by Tim Berners-Lee in 1989, made the Internet accessible to the general public through web browsers.
      
      Today, billions of people use the Internet daily for various purposes, from social networking to online banking. The Internet of Things (IoT) is expanding its reach even further, connecting everyday devices to the network.`,
      wordCount: 150,
      isPublished: true,
      order: 1,
      questions: {
        create: [
          {
            questionNumber: 1,
            questionType: "true_false_ng",
            questionText: "ARPANET was developed in the 1960s.",
            options: ["True", "False", "Not Given"],
            correctAnswer: "True",
            explanation: "The passage explicitly states ARPANET was developed in the 1960s.",
            points: 1,
          },
          {
            questionNumber: 2,
            questionType: "multiple_choice",
            questionText: "Who created the World Wide Web?",
            options: ["Steve Jobs", "Bill Gates", "Tim Berners-Lee", "Mark Zuckerberg"],
            correctAnswer: "Tim Berners-Lee",
            explanation: "The passage states Tim Berners-Lee created the WWW in 1989.",
            points: 1,
          },
        ],
      },
    },
  });

  console.log("✅ Created reading exercise:", readingExercise.id);

  // Create sample writing tasks
  const writingTask1 = await prisma.writingTask.create({
    data: {
      title: "Task 1 - Bar Chart Analysis",
      taskType: "task1",
      category: "academic",
      prompt: `The bar chart below shows the percentage of households with internet access in five countries from 2010 to 2020.

Summarize the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
      imgUrl: "https://example.com/charts/internet-access.png",
      minWords: 150,
      timeLimit: 20,
      isPublished: true,
      order: 1,
    },
  });

  const writingTask2 = await prisma.writingTask.create({
    data: {
      title: "Task 2 - Education and Technology",
      taskType: "task2",
      category: "academic",
      prompt: `Some people believe that technology has made our lives more complicated, while others think it has made life easier.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
      minWords: 250,
      timeLimit: 40,
      isPublished: true,
      order: 2,
    },
  });

  console.log("✅ Created writing tasks:", writingTask1.id, writingTask2.id);

  // Create sample speaking exercises
  const speakingExercise = await prisma.speakingExercise.create({
    data: {
      title: "Part 1 - Introduction and Interview",
      description: "General questions about yourself and everyday topics",
      part: "part1",
      questions: [
        "Can you tell me about your hometown?",
        "What do you like most about living there?",
        "Do you prefer living in a city or the countryside? Why?",
      ],
      isPublished: true,
      order: 1,
    },
  });

  const speakingExercise2 = await prisma.speakingExercise.create({
    data: {
      title: "Part 2 - Describe a Book",
      description: "Individual long turn with cue card",
      part: "part2",
      topic: "A Book You Recently Read",
      cueCard: `Describe a book you recently read.

You should say:
- What the book was about
- Why you decided to read it
- What you learned from it
- And explain whether you would recommend it to others

You will have 1 minute to prepare and 2 minutes to speak.`,
      questions: [],
      prepTime: 60,
      speakingTime: 120,
      isPublished: true,
      order: 2,
    },
  });

  console.log("✅ Created speaking exercises:", speakingExercise.id, speakingExercise2.id);

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
