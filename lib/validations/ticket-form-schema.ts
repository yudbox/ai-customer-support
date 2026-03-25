import { z } from "zod";

/**
 * Ticket form validation schema (Zod)
 * Validates customer support ticket submission form
 * Используется в react-hook-form и tRPC роутере
 */
export const ticketFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(500, "Subject must be 500 characters or less"),
  body: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be 5000 characters or less"),
  order_number: z.string().optional(), // Optional field for linking to order
});

export type TicketFormData = z.infer<typeof ticketFormSchema>;
