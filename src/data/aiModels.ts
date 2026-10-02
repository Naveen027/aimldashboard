export type AiModelType = "llm" | "vision" | "embedding" | "other";

export interface AiModelDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  highlights: string[];
  type: AiModelType;
}

export const aiModelCatalog: AiModelDefinition[] = [
  {
    id: "kartavya-face-matching",
    name: "Face Matching as a Service",
    category: "KARTAVYA",
    description: "Karnataka Advanced Attendance Management System.",
    highlights: ["99.8% Accuracy", "Fraud prevention"],
    type: "vision",
  },
  {
    id: "muzzle-print-identification",
    name: "AI-Based Muzzle Print Identification",
    category: "Livestock Management",
    description:
      "Livestock Management with real-time pattern recognition and identification.",
    highlights: ["Biometric", "Livestock Tracking"],
    type: "vision",
  },
  {
    id: "grievance-management",
    name: "AI-Based Grievance Management",
    category: "Grievance Management",
    description:
      "Intelligent system for tracking and resolving issues with 95% accuracy.",
    highlights: ["v3.2.1"],
    type: "llm",
  },
  {
    id: "government-order-information",
    name: "Government Order Information Tool",
    category: "Government Documents",
    description:
      "Automated extraction and summarization of critical government documents.",
    highlights: ["99% Accuracy", "Analyzer", "Management"],
    type: "other",
  },
  {
    id: "ai-enabled-chatbots",
    name: "AI-Enabled Chatbots",
    category: "Conversational AI",
    description:
      "Autonomous AI chatbots that learn and adapt in real-world environments.",
    highlights: ["Multi-lingual", "LLM-powered"],
    type: "llm",
  },
  {
    id: "kannada-kasthuri",
    name: "Kannada Kasthuri",
    category: "Kannada Translation",
    description:
      "Kannada Kasthuri delivers superior English-to-Kannada translation quality.",
    highlights: ["Context-aware", "Multi-domain"],
    type: "llm",
  },
];
