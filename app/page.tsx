"use client";

import { useState } from "react";

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  sentiment_label: string | null;
  created_at: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  order: {
    id: string;
  } | null;
}

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tickets");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch tickets");
      }

      setTickets(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
      pending_approval: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "text-red-600",
      high: "text-orange-600",
      medium: "text-yellow-600",
      low: "text-green-600",
    };
    return colors[priority] || "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Customer Support
          </h1>
          <p className="text-gray-600">
            Database connection test - First 10 tickets
          </p>
        </div>

        {/* Fetch Button */}
        <div className="mb-6">
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Loading..." : "Fetch Tickets from DB"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tickets List */}
        {tickets.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Tickets ({tickets.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-gray-500">
                          {ticket.ticket_number}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                        <span
                          className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}
                        >
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {ticket.subject}
                      </h3>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Customer:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {ticket.customer.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 text-gray-900">
                        {ticket.customer.email}
                      </span>
                    </div>
                    {ticket.sentiment_label && (
                      <div>
                        <span className="text-gray-500">Sentiment:</span>
                        <span
                          className={`ml-2 font-medium ${
                            ticket.sentiment_label === "ANGRY"
                              ? "text-red-600"
                              : ticket.sentiment_label === "POSITIVE"
                                ? "text-green-600"
                                : "text-gray-600"
                          }`}
                        >
                          {ticket.sentiment_label}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(ticket.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                    {ticket.order && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Order ID:</span>
                        <span className="ml-2 text-gray-900 font-mono text-xs">
                          {ticket.order.id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tickets.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              Click "Fetch Tickets" to load data from PostgreSQL
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
