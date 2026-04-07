import { SentimentLabel } from "@/lib/types/common";

interface AIAnalysisProps {
  category: string | undefined | null;
  sentimentLabel: SentimentLabel | undefined | null;
  sentimentScore: number | undefined | null;
  priorityScore: number | undefined | null;
  order?: {
    order_number: string;
    total_price: number;
  } | null;
}

export function AIAnalysis({
  category,
  sentimentLabel,
  sentimentScore,
  priorityScore,
  order,
}: AIAnalysisProps) {
  const getSentimentDisplay = () => {
    if (sentimentLabel === SentimentLabel.ANGRY) return "😡 ANGRY";
    if (sentimentLabel === SentimentLabel.NEUTRAL) return "😐 NEUTRAL";
    return "😊 POSITIVE";
  };

  const getSentimentPercentage = () => {
    return sentimentScore ? (sentimentScore * 100).toFixed(0) : "N/A";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">🤖 AI Analysis</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Category</p>
          <p className="text-sm text-gray-900">{category || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Sentiment</p>
          <p className="text-sm text-gray-900">
            {getSentimentDisplay()} ({getSentimentPercentage()}%)
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Priority Score</p>
          <p className="text-sm text-gray-900">{priorityScore ?? "N/A"}/100</p>
        </div>
        {order && (
          <div>
            <p className="text-sm font-medium text-gray-500">Order</p>
            <p className="text-sm text-gray-900">
              #{order.order_number} (${order.total_price})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
