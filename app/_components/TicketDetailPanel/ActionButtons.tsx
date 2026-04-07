import { Button } from "@/components/ui/button";
import { TeamCode } from "@/lib/types/common";

interface ActionButtonsProps {
  selectedTeam: TeamCode | string;
  onTeamChange: (team: TeamCode | string) => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
  isApproveDisabled: boolean;
}

export function ActionButtons({
  selectedTeam,
  onTeamChange,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
  isApproveDisabled,
}: ActionButtonsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <label
          htmlFor="team-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Assign to Team:
        </label>
        <select
          id="team-select"
          value={selectedTeam}
          onChange={(e) => onTeamChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={TeamCode.TECHNICAL_SUPPORT}>
            Technical Support (Tier 2)
          </option>
          <option value={TeamCode.CUSTOMER_SERVICE}>
            Customer Service (Tier 1)
          </option>
          <option value={TeamCode.BILLING}>Billing Team</option>
          <option value="escalation">Escalation Team (Tier 3)</option>
        </select>
      </div>

      <div className="flex gap-4">
        <Button variant="destructive" onClick={onReject} disabled={isRejecting}>
          ❌ Reject
        </Button>
        <Button
          variant="primary"
          onClick={onApprove}
          disabled={isApproving || isApproveDisabled}
          className="ml-auto"
        >
          ✅ Approve & Assign to {selectedTeam.replaceAll("_", " ")}
        </Button>
      </div>
    </div>
  );
}
