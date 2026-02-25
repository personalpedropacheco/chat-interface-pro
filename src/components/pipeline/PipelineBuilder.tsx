import { useState } from "react";
import { Plus, X, ChevronRight, Play, GripVertical } from "lucide-react";
import { Agent, Pipeline, PRESET_AGENTS, AGENT_COLORS } from "@/types/pipeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface PipelineBuilderProps {
  pipeline: Pipeline;
  onAddAgent: (agent: Agent) => void;
  onRemoveAgent: (index: number) => void;
  onUpdatePipeline: (updates: Partial<Pick<Pipeline, "name" | "agents">>) => void;
}

export function PipelineBuilder({
  pipeline,
  onAddAgent,
  onRemoveAgent,
  onUpdatePipeline,
}: PipelineBuilderProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customAgent, setCustomAgent] = useState<Partial<Agent>>({
    name: "",
    description: "",
    systemPrompt: "",
  });

  const handleAddPreset = (preset: Agent) => {
    onAddAgent(preset);
    setAddDialogOpen(false);
  };

  const handleAddCustom = () => {
    if (!customAgent.name || !customAgent.systemPrompt) return;
    const agent: Agent = {
      id: `custom-${Date.now()}`,
      name: customAgent.name || "Custom Agent",
      description: customAgent.description || "",
      systemPrompt: customAgent.systemPrompt || "",
      model: "gpt-4o",
      color: AGENT_COLORS[pipeline.agents.length % AGENT_COLORS.length],
    };
    onAddAgent(agent);
    setAddDialogOpen(false);
    setCustomMode(false);
    setCustomAgent({ name: "", description: "", systemPrompt: "" });
  };

  return (
    <div className="space-y-4">
      {/* Pipeline name */}
      <div className="flex items-center gap-2">
        <Input
          value={pipeline.name}
          onChange={(e) => onUpdatePipeline({ name: e.target.value })}
          className="text-lg font-semibold border-none bg-transparent px-0 focus-visible:ring-0 h-auto"
          placeholder="Pipeline name..."
        />
      </div>

      {/* Agent chain visualization */}
      <div className="flex flex-wrap items-center gap-2">
        {pipeline.agents.map((agent, i) => (
          <div key={`${agent.id}-${i}`} className="flex items-center gap-2">
            <Card className="relative group px-4 py-3 flex items-center gap-3 border-2 transition-colors hover:shadow-md" style={{ borderColor: agent.color }}>
              <GripVertical className="h-4 w-4 text-muted-foreground/40" />
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: agent.color }}
              />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{agent.name}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {agent.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onRemoveAgent(i)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Card>
            {i < pipeline.agents.length - 1 && (
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
          </div>
        ))}

        {/* Add agent button */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 border-dashed">
              <Plus className="h-4 w-4" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Agent to Pipeline</DialogTitle>
            </DialogHeader>

            {!customMode ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Choose a preset or create a custom agent.</p>
                <div className="grid gap-2">
                  {PRESET_AGENTS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleAddPreset(preset)}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-accent transition-colors"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: preset.color }}
                      />
                      <div>
                        <p className="font-medium text-sm">{preset.name}</p>
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCustomMode(true)}
                >
                  Create Custom Agent
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Agent name"
                  value={customAgent.name}
                  onChange={(e) => setCustomAgent((p) => ({ ...p, name: e.target.value }))}
                />
                <Input
                  placeholder="Short description"
                  value={customAgent.description}
                  onChange={(e) => setCustomAgent((p) => ({ ...p, description: e.target.value }))}
                />
                <Textarea
                  placeholder="System prompt — what should this agent do?"
                  value={customAgent.systemPrompt}
                  onChange={(e) => setCustomAgent((p) => ({ ...p, systemPrompt: e.target.value }))}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCustomMode(false)}>
                    Back
                  </Button>
                  <Button onClick={handleAddCustom} disabled={!customAgent.name || !customAgent.systemPrompt}>
                    Add Agent
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {pipeline.agents.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {pipeline.agents.length} agent{pipeline.agents.length !== 1 ? "s" : ""}
          </Badge>
          <span>Sequential pipeline — output of each agent feeds into the next</span>
        </div>
      )}
    </div>
  );
}
