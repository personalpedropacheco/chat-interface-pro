import { useState } from "react";
import { Send, Square, Workflow, ArrowLeft } from "lucide-react";
import { usePipeline } from "@/hooks/use-pipeline";
import { PipelineBuilder } from "@/components/pipeline/PipelineBuilder";
import { PipelineRunView } from "@/components/pipeline/PipelineRunView";
import { ThemeToggle } from "@/components/chat/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export default function PipelinePage() {
  const navigate = useNavigate();
  const {
    pipelines,
    activePipeline,
    activePipelineId,
    setActivePipelineId,
    createPipeline,
    updatePipeline,
    addAgentToPipeline,
    removeAgentFromPipeline,
    runs,
    runPipeline,
    stopRun,
    isRunning,
    presetAgents,
  } = usePipeline();

  const [input, setInput] = useState("");

  const activeRuns = runs.filter((r) => r.pipelineId === activePipelineId);

  const handleRun = () => {
    if (!input.trim() || isRunning) return;
    runPipeline(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 h-12 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Workflow className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Pipeline Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={activePipelineId} onValueChange={setActivePipelineId}>
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => createPipeline("New Pipeline", [presetAgents[0]])}
          >
            New Pipeline
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Builder */}
      {activePipeline && (
        <div className="border-b border-border px-6 py-4 bg-card/50">
          <PipelineBuilder
            pipeline={activePipeline}
            onAddAgent={(agent) => addAgentToPipeline(activePipeline.id, agent)}
            onRemoveAgent={(index) => removeAgentFromPipeline(activePipeline.id, index)}
            onUpdatePipeline={(updates) => updatePipeline(activePipeline.id, updates)}
          />
        </div>
      )}

      {/* Run results */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeRuns.length > 0 && activePipeline ? (
          <PipelineRunView run={activeRuns[0]} pipeline={activePipeline} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <Workflow className="h-12 w-12 text-primary/30" />
            <p className="text-sm">Configure your agent pipeline above, then send a message to run it.</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3 bg-card/50">
        <div className="mx-auto max-w-3xl flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your prompt — it will flow through each agent in the pipeline…"
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          {isRunning ? (
            <Button variant="destructive" size="icon" onClick={stopRun} className="shrink-0 self-end">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleRun}
              disabled={!input.trim() || !activePipeline?.agents.length}
              className="shrink-0 self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
