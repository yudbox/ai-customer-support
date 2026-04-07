interface TicketMessageProps {
  subject: string;
  body: string;
}

export function TicketMessage({ subject, body }: TicketMessageProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        📧 Ticket Message
      </h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Subject</p>
          <p className="text-gray-900 font-medium">{subject}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Message</p>
          <p className="text-gray-900 whitespace-pre-wrap">{body}</p>
        </div>
      </div>
    </div>
  );
}
