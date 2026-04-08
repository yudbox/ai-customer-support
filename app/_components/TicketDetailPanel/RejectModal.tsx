import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rejectReason: string;
  onReasonChange: (reason: string) => void;
  isPending: boolean;
}

export function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  rejectReason,
  onReasonChange,
  isPending,
}: RejectModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Ticket">
      <div className="space-y-4">
        <p className="text-gray-700">
          Please provide a reason for rejecting this ticket:
        </p>

        <Textarea
          rows={4}
          placeholder="Enter rejection reason..."
          value={rejectReason}
          onChange={(e) => onReasonChange(e.target.value)}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- WCAG 2.1.1: Modal dialogs must move focus inside on open
          autoFocus
          className="focus:ring-red-500"
          aria-label="Rejection reason"
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!rejectReason.trim()}
            isPending={isPending}
          >
            ❌ Confirm Rejection
          </Button>
        </div>
      </div>
    </Modal>
  );
}
