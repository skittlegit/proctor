import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TypedAnswer({ value, onChange, onDone, doneLabel = "Next question" }: { value: string; onChange: (value: string) => void; onDone: () => void; doneLabel?: string }) {
  return <div className="border-t border-line bg-surface-soft p-[var(--assessment-panel-pad)]"><label htmlFor="typed-answer" className="block text-sm font-semibold text-ink">Your written answer</label><p className="mt-1 text-xs text-muted">Camera and microphone are off. Type your response to continue.</p><textarea id="typed-answer" value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-3 w-full resize-y rounded-lg border border-line bg-surface p-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink/30" placeholder="Type your response here..." /><div className="mt-3 flex justify-end"><Button onClick={onDone} disabled={!value.trim()}>{doneLabel} <ArrowRight className="size-4" /></Button></div></div>;
}
