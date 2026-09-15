import { Router, type IRouter } from "express";
import {
  CreateSupportEscalationBody,
  CreateSupportEscalationResponse,
  GetSupportSummaryResponse,
  ListSupportTopicsResponse,
  SendSupportMessageBody,
  SendSupportMessageResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const topics = [
  {
    id: "academics",
    label: "Academics",
    description: "Courses, deadlines, exams, and study support",
    icon: "book-open",
    accent: "coral",
  },
  {
    id: "wellbeing",
    label: "Wellbeing",
    description: "Counselling, accessibility, and feeling supported",
    icon: "heart",
    accent: "mint",
  },
  {
    id: "money",
    label: "Money & funding",
    description: "Fees, financial aid, scholarships, and budgeting",
    icon: "wallet",
    accent: "sun",
  },
  {
    id: "campus-life",
    label: "Campus life",
    description: "Clubs, housing, events, and getting involved",
    icon: "sparkles",
    accent: "lavender",
  },
];

const summary = {
  responseTime: "< 30 sec",
  availability: "Available 24/7",
  helpfulAnswers: 94,
  teamStatus: "Support team online",
};

router.get("/student-support/topics", (_req, res) => {
  res.json(ListSupportTopicsResponse.parse(topics));
});

router.get("/student-support/summary", (_req, res) => {
  res.json(GetSupportSummaryResponse.parse(summary));
});

router.post("/student-support/chat", (req, res) => {
  const parsed = SendSupportMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please enter a question to get started." });
    return;
  }

  const message = parsed.data.message.toLowerCase();
  let topic = "general";
  let answer =
    "I can help you find the right campus resource. Tell me a little more about what you need, and I’ll point you in the right direction.";
  let sources = ["Student Support Centre"];
  let suggestedFollowUp = "Would you like help finding the right team?";

  if (
    message.includes("exam") ||
    message.includes("course") ||
    message.includes("assignment") ||
    message.includes("study") ||
    message.includes("class")
  ) {
    topic = "academics";
    answer =
      "For course and exam support, start with your course portal for deadlines and announcements. If you need more help, your academic adviser or the learning centre can help you make a plan. I can also help you find study support for a specific subject.";
    sources = ["Academic Advising", "Learning Centre", "Course portal"];
    suggestedFollowUp = "Are you looking for deadline help or study support?";
  } else if (
    message.includes("stress") ||
    message.includes("anxious") ||
    message.includes("counsel") ||
    message.includes("wellbeing") ||
    message.includes("mental")
  ) {
    topic = "wellbeing";
    answer =
      "You do not have to handle that alone. Student counselling and wellbeing services can help with both urgent support and ongoing care. If you feel unsafe right now, contact your local emergency service or campus emergency team immediately.";
    sources = ["Student Wellbeing", "Counselling Services", "Accessibility Office"];
    suggestedFollowUp = "Would you like help finding immediate or ongoing support?";
  } else if (
    message.includes("fee") ||
    message.includes("fund") ||
    message.includes("scholar") ||
    message.includes("money") ||
    message.includes("financial")
  ) {
    topic = "money";
    answer =
      "For fees and funding, the student finance team can explain your balance, payment dates, and available support. Financial aid and scholarship advisers can also check whether you may be eligible for additional help.";
    sources = ["Student Finance", "Financial Aid", "Scholarships Office"];
    suggestedFollowUp = "Do you need help with fees, funding, or a scholarship?";
  } else if (
    message.includes("club") ||
    message.includes("housing") ||
    message.includes("event") ||
    message.includes("campus") ||
    message.includes("accommodation")
  ) {
    topic = "campus-life";
    answer =
      "Campus life support can help with housing, clubs, events, and getting connected. The student life hub is a good starting point, and I can help narrow this down to housing, activities, or a specific campus service.";
    sources = ["Student Life Hub", "Housing Services", "Campus Events"];
    suggestedFollowUp = "Are you looking for housing, activities, or an event?";
  }

  const response = SendSupportMessageResponse.parse({
    id: crypto.randomUUID(),
    answer,
    topic,
    sources,
    suggestedFollowUp,
  });
  res.json(response);
});

router.post("/student-support/escalations", (req, res) => {
  const parsed = CreateSupportEscalationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all required fields." });
    return;
  }

  const response = CreateSupportEscalationResponse.parse({
    id: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "Received",
    eta: "A team member will respond within 1 business day.",
    message: `Thanks, ${parsed.data.name}. Your request has been sent to the student support team.`,
  });
  res.status(201).json(response);
});

export default router;