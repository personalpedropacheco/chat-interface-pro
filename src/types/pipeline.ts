export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  color: string;
}

export interface PipelineStep {
  agentId: string;
  input: string;
  output: string;
  status: "pending" | "running" | "done" | "error";
}

export interface Pipeline {
  id: string;
  name: string;
  agents: Agent[];
  createdAt: Date;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  userInput: string;
  steps: PipelineStep[];
  status: "idle" | "running" | "done" | "error";
  startedAt?: Date;
  completedAt?: Date;
}

export const AGENT_COLORS = [
  "hsl(200, 98%, 39%)",   // primary blue
  "hsl(142, 71%, 45%)",   // green
  "hsl(280, 68%, 55%)",   // purple
  "hsl(25, 95%, 53%)",    // orange
  "hsl(340, 75%, 55%)",   // pink
  "hsl(45, 93%, 47%)",    // amber
] as const;

export const PRESET_AGENTS: Agent[] = [
  {
    id: "researcher",
    name: "Researcher",
    description: "Gathers and synthesizes information on a topic",
    systemPrompt: "You are a research agent. Analyze the input thoroughly and provide key findings, data points, and relevant context.",
    model: "gpt-4o",
    color: AGENT_COLORS[0],
  },
  {
    id: "analyst",
    name: "Analyst",
    description: "Analyzes data and draws conclusions",
    systemPrompt: "You are an analytical agent. Take the research provided and identify patterns, insights, and actionable conclusions.",
    model: "gpt-4o",
    color: AGENT_COLORS[1],
  },
  {
    id: "writer",
    name: "Writer",
    description: "Crafts polished written output",
    systemPrompt: "You are a writing agent. Take the analysis provided and craft a clear, compelling, well-structured document.",
    model: "gpt-4o",
    color: AGENT_COLORS[2],
  },
  {
    id: "reviewer",
    name: "Reviewer",
    description: "Reviews and improves content quality",
    systemPrompt: "You are a review agent. Critique the content for accuracy, clarity, and completeness. Provide an improved version.",
    model: "gpt-4o",
    color: AGENT_COLORS[3],
  },
  {
    id: "summarizer",
    name: "Summarizer",
    description: "Creates concise summaries",
    systemPrompt: "You are a summarization agent. Distill the input into a clear, concise summary with key takeaways.",
    model: "gpt-4o",
    color: AGENT_COLORS[4],
  },
];
