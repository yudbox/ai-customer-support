import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database/connection";
import { Ticket } from "@/lib/database/entities/Ticket";

export async function GET() {
  try {
    // Get database connection (singleton)
    const dataSource = await getDataSource();

    // Get first 10 tickets with related customer data
    const tickets = await dataSource
      .getRepository(Ticket)
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.customer", "customer")
      .leftJoinAndSelect("ticket.order", "order")
      .orderBy("ticket.created_at", "DESC")
      .take(10)
      .getMany();

    return NextResponse.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
