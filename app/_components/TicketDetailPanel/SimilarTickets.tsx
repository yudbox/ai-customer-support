interface SimilarTicket {
  similarity: number;
  subject: string;
  resolution: string;
}

interface SimilarTicketsProps {
  isLoading: boolean;
  similarTickets: SimilarTicket[] | undefined;
  suggestedSolution: string | undefined;
  selectedIndex: number | null;
  onSelectTicket: (index: number, resolution: string) => void;
}

export function SimilarTickets({
  isLoading,
  similarTickets,
  suggestedSolution,
  selectedIndex,
  onSelectTicket,
}: SimilarTicketsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        🔍 Similar Resolved Tickets
      </h2>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">
            Searching Pinecone for similar tickets...
          </p>
        </div>
      ) : similarTickets && similarTickets.length > 0 ? (
        <div className="space-y-4">
          {similarTickets.map((similar, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => onSelectTicket(idx, similar.resolution)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectTicket(idx, similar.resolution);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`border-l-4 p-4 rounded cursor-pointer transition-colors ${
                  isSelected
                    ? "border-green-500 bg-green-50 hover:bg-green-100"
                    : "border-blue-500 bg-blue-50 hover:bg-blue-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-blue-700">
                        [{(similar.similarity * 100).toFixed(0)}% match]
                      </span>
                      <span className="text-sm text-gray-600">
                        {similar.subject}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        Resolution:
                      </span>
                      <p className="mt-1 text-gray-600">{similar.resolution}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-green-600 text-2xl font-bold ml-2">
                      ✓
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {suggestedSolution && (
            <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h3 className="text-sm font-bold text-green-800 mb-2">
                💡 AI Recommended Solution (Best Match)
              </h3>
              <p className="text-sm text-gray-700">{suggestedSolution}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm font-medium">❌ No similar tickets found</p>
          <p className="text-xs mt-2">
            This appears to be the first ticket of this type.
          </p>
          <p className="text-xs mt-1 text-gray-400">
            Manual investigation required by support team.
          </p>
        </div>
      )}
    </div>
  );
}
