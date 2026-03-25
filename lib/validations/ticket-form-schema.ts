import * as yup from "yup";

/**
 * Ticket form validation schema
 * Validates customer support ticket submission form
 */
export const ticketFormSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  subject: yup
    .string()
    .required("Subject is required")
    .max(500, "Subject must be 500 characters or less"),
  body: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be 5000 characters or less"),
});

export type TicketFormData = yup.InferType<typeof ticketFormSchema>;
