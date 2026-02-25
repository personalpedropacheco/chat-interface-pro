import { useRef, useEffect } from "react";
import { CheckCircle2, Loader2, Clock, AlertCircle } from "lucide-react";
import { PipelineRun, Pipeline } from "@/types/pipeline";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PipelineRunViewProps {
  run: PipelineRun;
  pipeline: Pipeline;
}

const statusIcon = {
  pending: <Clock className="h-4 w-4 text-muted-foreground" />,
  running: <Loader2 className="h-4 w-4 text-primary animate-spin" />,
  done: <CheckCircle2 className="h-4 w-4 text-primary" />,
  error: <AlertCircle className="h-4 w-4 text-destructive" />,
};

export function PipelineRunView({ run, pipeline }: PipelineRunViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [run.steps]);

  return (
    <div ref={scrollRef} className="space-y-4 overflow-y-auto flex-1 py-4">
      {/* User input */}
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
            U
          </div>
          <div className="bg-accent/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
            {run.userInput}
          </div>
        </div>
      </div>

      {/* Steps */}
      {run.steps.map((step, i) => {
        const agent = pipeline.agents[i];
        if (!agent) return null;
        if (step.status === "pending") return null;

        return (
          <div key={`${step.agentId}-${i}`} className="mx-auto max-w-3xl">
            <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: agent.color }}>
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                {statusIcon[step.status]}
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: agent.color }}
                />
                <span className="font-medium text-sm">{agent.name}</span>
                <Badge variant="outline" className="text-[10px] ml-auto">
                  Step {i + 1} of {pipeline.agents.length}
                </Badge>
              </div>
              {step.output && (
                <div className="px-4 py-3 text-sm prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {step.output}
                  </ReactMarkdown>
                </div>
              )}
            </Card>
          </div>
        );
      })}

      {/* Completion badge */}
      {run.status === "done" && (
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Pipeline complete — {pipeline.agents.length} agents executed
          </Badge>
        </div>
      )}
    </div>
  );
}
