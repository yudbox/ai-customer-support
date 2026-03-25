import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database/connection";
import { Customer, CustomerTier } from "@/lib/database/entities/Customer";
import {
  Ticket,
  TicketStatus,
  TicketPriority,
} from "@/lib/database/entities/Ticket";
import { Order } from "@/lib/database/entities/Order";

interface CreateTicketRequest {
  email: string;
  subject: string;
  body: string;
  order_number?: string;
}

// Generate ticket number: TKT-YYYY-MMDD-XXXX
function generateTicketNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `TKT-${year}-${month}${day}-${random}`;
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  let connection;

  try {
    // Parse request body
    const body: CreateTicketRequest = await request.json();

    // Validate required fields
    if (!body.email || !body.subject || !body.body) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: email, subject, body",
        },
        { status: 400 },
      );
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 },
      );
    }

    // Validate field lengths
    if (body.subject.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject must be 500 characters or less",
        },
        { status: 400 },
      );
    }

    if (body.body.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: "Body must be 5000 characters or less",
        },
        { status: 400 },
      );
    }

    // Get database connection
    connection = await getDataSource();
    const customerRepo = connection.getRepository(Customer);
    const ticketRepo = connection.getRepository(Ticket);
    const orderRepo = connection.getRepository(Order);

    // Find or create customer by email
    let customer = await customerRepo.findOne({
      where: { email: body.email },
    });

    if (!customer) {
      // Extract name from email (before @)
      const name = body.email.split("@")[0];

      // Create new customer
      customer = customerRepo.create({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: body.email,
        tier: CustomerTier.NEW,
        total_orders: 0,
        total_spent: 0,
        lifetime_value: 0,
      });

      customer = await customerRepo.save(customer);
    }

    // Find order if order_number provided
    let order: Order | null = null;
    if (body.order_number) {
      order = await orderRepo.findOne({
        where: { order_number: body.order_number },
      });

      // If order not found, it's okay - we'll just not link it
      // User might have provided wrong order number
    }

    // Generate ticket number
    const ticketNumber = generateTicketNumber();

    // Create ticket
    const ticket = ticketRepo.create({
      ticket_number: ticketNumber,
      subject: body.subject,
      body: body.body,
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      customer_id: customer.id,
      order_id: order?.id,
    });

    const savedTicket: Ticket = await ticketRepo.save(ticket);

    return NextResponse.json(
      {
        success: true,
        data: {
          ticket_number: savedTicket.ticket_number,
          id: savedTicket.id,
          status: savedTicket.status,
          created_at: savedTicket.created_at,
        },
        message: "Ticket created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating ticket:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create ticket",
      },
      { status: 500 },
    );
  }
}
