import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ResolutionEditorProps {
  resolutionText: string;
  onResolutionChange: (text: string) => void;
  suggestedSolution?: string;
}

export function ResolutionEditor({
  resolutionText,
  onResolutionChange,
  suggestedSolution,
}: ResolutionEditorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">✍️ Resolution</h2>
        <div className="flex gap-2">
          {suggestedSolution && (
            <Button
              variant="secondary"
              onClick={() => onResolutionChange(suggestedSolution)}
              className="text-sm"
            >
              🤖 Use AI Solution
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => onResolutionChange("")}
            className="text-sm"
          >
            ✏️ Write Custom
          </Button>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={resolutionText}
          onChange={(e) => onResolutionChange(e.target.value)}
          placeholder="Enter resolution for this ticket... (required)"
          rows={6}
          className="font-mono text-sm shadow-sm"
        />
        <div className="mt-2 flex items-center justify-between">
          <span
            className={`text-xs ${
              resolutionText.trim()
                ? "text-green-600 font-medium"
                : "text-red-500"
            }`}
          >
            {resolutionText.trim()
              ? `✓ ${resolutionText.length} characters`
              : "⚠️ Resolution required"}
          </span>
        </div>
      </div>
    </div>
  );
}
