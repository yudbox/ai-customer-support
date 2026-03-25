import { TicketForm } from "./_components/TicketForm";

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Customer Support
          </h1>
          <p className="text-gray-600 text-lg">
            Submit a support ticket and let our AI agents handle it
          </p>
        </div>

        {/* Ticket Submission Form */}
        <TicketForm />
      </div>
    </div>
  );
}

// Next.js requires default export for pages
export default HomePage;
