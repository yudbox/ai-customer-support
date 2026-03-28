"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { trpc } from "@/lib/trpc/client";

interface TicketFormProps {
  onSubmitSuccess?: (ticketId: string) => void;
}

export function TicketForm({ onSubmitSuccess }: TicketFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      email: "",
      subject: "",
      body: "",
    },
  });

  const [selectedScenario, setSelectedScenario] = useState<string>("");

  // tRPC mutation для создания тикета
  const createTicketMutation = trpc.tickets.create.useMutation({
    onSuccess: (data) => {
      // Notify parent component
      if (onSubmitSuccess) {
        onSubmitSuccess(data.id);
      }
      reset();
      setSelectedScenario("");
    },
  });

  // Watch field values for character counters
  const subjectValue = watch("subject");
  const bodyValue = watch("body");

  const onSubmit = async (data: TicketFormData) => {
    createTicketMutation.mutate(data);
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
    <div className="w-full">
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

          {/* Order Number */}
          <Input
            type="text"
            label="Order Number (optional)"
            placeholder="Order number (optional)"
            {...register("order_number")}
          />

          {/* Error Message */}
          {createTicketMutation.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">
                {createTicketMutation.error.message}
              </p>
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
                disabled={createTicketMutation.isPending}
                variant="primary"
                size="md"
                className="w-full"
              >
                {createTicketMutation.isPending
                  ? "🔄 Submitting..."
                  : "🚀 Submit Ticket"}
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
