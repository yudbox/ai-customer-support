"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  getScenarioOptions,
  getScenarioById,
} from "@/lib/constants/ticket-scenarios";
import {
  ticketFormSchema,
  type TicketFormData,
} from "@/lib/validations/ticket-form-schema";

export function TicketForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<TicketFormData>({
    resolver: yupResolver(ticketFormSchema),
    defaultValues: {
      email: "",
      subject: "",
      body: "",
    },
  });

  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Watch field values for character counters
  const subjectValue = watch("subject");
  const bodyValue = watch("body");

  const onSubmit = async (data: TicketFormData) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/tickets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          subject: data.subject,
          body: data.body,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create ticket");
      }

      setSuccess(
        `Ticket created successfully! Ticket number: ${result.data.ticket_number}`,
      );

      // Reset form and scenario
      reset();
      setSelectedScenario("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scenarioId = e.target.value;
    setSelectedScenario(scenarioId);

    if (!scenarioId) {
      // Reset form if "Select..." is chosen
      reset();
      return;
    }

    const scenario = getScenarioById(scenarioId);
    if (scenario) {
      setValue("email", scenario.email);
      setValue("subject", scenario.subject);
      setValue("body", scenario.body);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Submit a Support Ticket
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <Input
            type="email"
            label="Email Address"
            placeholder="your.email@example.com"
            error={errors.email?.message}
            required
            {...register("email")}
          />

          {/* Subject */}
          <div>
            <Input
              type="text"
              label="Subject"
              placeholder="Brief description of your issue"
              error={errors.subject?.message}
              required
              maxLength={500}
              {...register("subject")}
            />
            <p className="mt-1.5 text-xs text-gray-500">
              {subjectValue?.length || 0}/500 characters
            </p>
          </div>

          {/* Body */}
          <Textarea
            label="Description"
            placeholder="Please provide detailed information about your issue..."
            error={errors.body?.message}
            required
            maxLength={5000}
            rows={6}
            showCharCount
            currentLength={bodyValue?.length || 0}
            {...register("body")}
          />

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {/* Quick Fill Dropdown */}
            <div className="flex-1 w-full">
              <Select
                label="🎲 Quick Fill Scenario"
                options={getScenarioOptions()}
                placeholder="Select a scenario to auto-fill..."
                value={selectedScenario}
                onChange={handleScenarioChange}
              />
            </div>

            {/* Submit Button */}
            <div className="flex-1 w-full">
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                size="md"
                className="w-full"
              >
                {isSubmitting ? "🔄 Submitting..." : "🚀 Submit Ticket"}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Our AI-powered support system will analyze your request and get back
            to you shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
