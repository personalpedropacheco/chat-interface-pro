import { useState, useCallback, useRef } from "react";
import { Agent, Pipeline, PipelineRun, PipelineStep, PRESET_AGENTS, AGENT_COLORS } from "@/types/pipeline";

const MOCK_RESPONSES: Record<string, (input: string) => string> = {
  researcher: (input) =>
    `## Research Findings\n\nAfter analyzing the topic "${input.slice(0, 60)}…", here are the key findings:\n\n1. **Market Context**: The landscape is evolving rapidly with significant shifts in user expectations and technology capabilities.\n2. **Key Data Points**: Studies show a 40% increase in adoption over the past year, with enterprise segments leading growth.\n3. **Competitive Analysis**: Three major players dominate, but emerging solutions are gaining traction through specialization.\n4. **Risks**: Regulatory uncertainty and integration complexity remain primary concerns.\n\n> Sources reviewed: 12 reports, 8 case studies, 3 industry surveys.`,

  analyst: (input) =>
    `## Analysis\n\nBased on the research provided, here's the analytical breakdown:\n\n### Key Insights\n- **Trend Direction**: Strong upward trajectory with seasonal variation\n- **Root Cause**: Adoption is driven by cost reduction (35%) and efficiency gains (45%)\n- **Correlation**: Higher adoption rates correlate with organizations that have dedicated teams\n\n### Recommendations\n| Priority | Action | Expected Impact |\n|----------|--------|----------------|\n| High | Invest in automation | 30% efficiency gain |\n| Medium | Expand partnerships | 20% market reach |\n| Low | Optimize pricing | 10% margin improvement |\n\n### Risk Assessment\nOverall risk: **Moderate**. Primary mitigation: phased rollout with clear success metrics.`,

  writer: (input) =>
    `# Executive Brief\n\nThe analysis reveals a compelling opportunity that warrants strategic attention. Here's a structured overview:\n\n## Summary\nThe market is experiencing significant transformation. Organizations that move decisively stand to capture outsized returns, while late movers face increasing barriers to entry.\n\n## Key Arguments\n**First**, the data supports a clear trend toward consolidation. Early positioning matters.\n\n**Second**, the ROI case is strong — organizations report 2-3x returns within the first year of adoption.\n\n**Third**, the competitive window is narrowing. Acting within the next quarter provides optimal timing.\n\n## Recommended Next Steps\n1. Assemble a cross-functional task force\n2. Conduct a 30-day deep-dive assessment\n3. Develop a phased implementation roadmap\n\n*This brief was synthesized from comprehensive research and analytical review.*`,

  reviewer: (input) =>
    `## Review & Improvements\n\n### Quality Assessment: ★★★★☆\n\n**Strengths:**\n- Clear structure and logical flow\n- Actionable recommendations with measurable outcomes\n- Good balance of data and narrative\n\n**Improvements Made:**\n- Sharpened the executive summary for C-suite audience\n- Added quantified metrics to support each recommendation\n- Strengthened the urgency argument with competitive timeline\n- Corrected minor logical gaps in the risk assessment\n\n### Final Verdict\nThe document is **ready for distribution** with minor revisions incorporated above. Confidence level: **High**.`,

  summarizer: (input) =>
    `## TL;DR\n\n**Key Takeaway**: Strong market opportunity requiring near-term action.\n\n**3 Things to Remember:**\n1. 📈 Market growing 40% YoY — early movers win\n2. 💰 2-3x ROI within first year of adoption\n3. ⏰ Competitive window closes in ~1 quarter\n\n**Recommended Action**: Launch a 30-day assessment with cross-functional team. Budget: Moderate. Risk: Low-Medium.`,
};

function getMockResponse(agent: Agent, input: string): string {
  const fn = MOCK_RESPONSES[agent.id] || MOCK_RESPONSES["writer"];
  return fn(input);
}

export function usePipeline() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: "default",
      name: "Research → Analyze → Write",
      agents: [PRESET_AGENTS[0], PRESET_AGENTS[1], PRESET_AGENTS[2]],
      createdAt: new Date(),
    },
  ]);
  const [activePipelineId, setActivePipelineId] = useState<string>("default");
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);

  const activePipeline = pipelines.find((p) => p.id === activePipelineId) || null;

  const createPipeline = useCallback((name: string, agents: Agent[]) => {
    const pipeline: Pipeline = {
      id: Date.now().toString(),
      name,
      agents,
      createdAt: new Date(),
    };
    setPipelines((prev) => [...prev, pipeline]);
    setActivePipelineId(pipeline.id);
    return pipeline.id;
  }, []);

  const updatePipeline = useCallback((id: string, updates: Partial<Pick<Pipeline, "name" | "agents">>) => {
    setPipelines((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deletePipeline = useCallback((id: string) => {
    setPipelines((prev) => prev.filter((p) => p.id !== id));
    if (activePipelineId === id) setActivePipelineId(pipelines[0]?.id || "");
  }, [activePipelineId, pipelines]);

  const addAgentToPipeline = useCallback((pipelineId: string, agent: Agent) => {
    setPipelines((prev) =>
      prev.map((p) =>
        p.id === pipelineId
          ? { ...p, agents: [...p.agents, { ...agent, id: `${agent.id}-${Date.now()}`, color: AGENT_COLORS[p.agents.length % AGENT_COLORS.length] }] }
          : p
      )
    );
  }, []);

  const removeAgentFromPipeline = useCallback((pipelineId: string, index: number) => {
    setPipelines((prev) =>
      prev.map((p) =>
        p.id === pipelineId
          ? { ...p, agents: p.agents.filter((_, i) => i !== index) }
          : p
      )
    );
  }, []);

  const runPipeline = useCallback(
    async (userInput: string) => {
      if (!activePipeline || activePipeline.agents.length === 0) return;

      abortRef.current = false;
      setIsRunning(true);

      const runId = Date.now().toString();
      const steps: PipelineStep[] = activePipeline.agents.map((agent) => ({
        agentId: agent.id,
        input: "",
        output: "",
        status: "pending" as const,
      }));

      const run: PipelineRun = {
        id: runId,
        pipelineId: activePipeline.id,
        userInput,
        steps,
        status: "running",
        startedAt: new Date(),
      };

      setRuns((prev) => [run, ...prev]);

      let currentInput = userInput;

      for (let i = 0; i < activePipeline.agents.length; i++) {
        if (abortRef.current) break;

        const agent = activePipeline.agents[i];
        const responseText = getMockResponse(agent, currentInput);

        // Set step to running
        setRuns((prev) =>
          prev.map((r) =>
            r.id === runId
              ? {
                  ...r,
                  steps: r.steps.map((s, si) =>
                    si === i ? { ...s, input: currentInput, status: "running" as const } : s
                  ),
                }
              : r
          )
        );

        // Simulate streaming character by character
        for (let j = 0; j < responseText.length; j++) {
          if (abortRef.current) break;
          await new Promise((resolve) => setTimeout(resolve, 8));
          const partial = responseText.slice(0, j + 1);
          setRuns((prev) =>
            prev.map((r) =>
              r.id === runId
                ? {
                    ...r,
                    steps: r.steps.map((s, si) =>
                      si === i ? { ...s, output: partial } : s
                    ),
                  }
                : r
            )
          );
        }

        // Mark step done
        setRuns((prev) =>
          prev.map((r) =>
            r.id === runId
              ? {
                  ...r,
                  steps: r.steps.map((s, si) =>
                    si === i ? { ...s, output: responseText, status: "done" as const } : s
                  ),
                }
              : r
          )
        );

        currentInput = responseText;
      }

      // Mark run complete
      setRuns((prev) =>
        prev.map((r) =>
          r.id === runId
            ? { ...r, status: abortRef.current ? "error" : "done", completedAt: new Date() }
            : r
        )
      );

      setIsRunning(false);
    },
    [activePipeline]
  );

  const stopRun = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
  }, []);

  return {
    pipelines,
    activePipeline,
    activePipelineId,
    setActivePipelineId,
    createPipeline,
    updatePipeline,
    deletePipeline,
    addAgentToPipeline,
    removeAgentFromPipeline,
    runs,
    runPipeline,
    stopRun,
    isRunning,
    presetAgents: PRESET_AGENTS,
  };
}
