import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

/**
 * Maximum characters for resolution preview before truncation
 */
export const RESOLUTION_PREVIEW_LENGTH = 200;

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedTeam: string;
  resolutionText: string;
  isPending: boolean;
}

export function ApproveModal({
  isOpen,
  onClose,
  onConfirm,
  selectedTeam,
  resolutionText,
  isPending,
}: ApproveModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Approval">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to approve this ticket and assign it to{" "}
          <span className="font-semibold">
            {selectedTeam.replace("_", " ")}
          </span>
          ?
        </p>

        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-1">Resolution:</p>
          <p className="text-sm text-gray-600">
            {resolutionText.substring(0, RESOLUTION_PREVIEW_LENGTH)}
            {resolutionText.length > RESOLUTION_PREVIEW_LENGTH ? "..." : ""}
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Approving..." : "✅ Confirm Approval"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
