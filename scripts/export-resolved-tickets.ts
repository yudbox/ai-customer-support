import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";

import { TicketStatus } from "@/lib/types/common";

import { AppDataSource } from "../lib/database/data-source";
import { Ticket } from "../lib/database/entities/Ticket";

/**
 * Export RESOLVED tickets from PostgreSQL to JSON
 * For RAG Agent (Agent 5) - Pinecone vector database seeding
 *
 * Usage:
 *   npm run export:tickets
 *   npm run export:tickets -- --file=custom-name.json
 */

interface ExportOptions {
  filename: string;
}

function parseArguments(): ExportOptions {
  const args = process.argv.slice(2);

  const fileArg = args.find((arg) => arg.startsWith("--file="));
  const filename = fileArg
    ? fileArg.split("=")[1]
    : `tickets-resolved-${new Date().toISOString().split("T")[0]}.json`;

  return { filename };
}

async function exportResolvedTickets() {
  try {
    console.log("🔍 Starting export of RESOLVED tickets...\n");

    // Initialize database connection
    await AppDataSource.initialize();
    console.log("✅ Database connection established\n");

    // Get arguments
    const options = parseArguments();

    // Query RESOLVED tickets with all needed fields for RAG
    console.log("📊 Querying RESOLVED tickets from PostgreSQL...");

    const tickets = await AppDataSource.getRepository(Ticket)
      .createQueryBuilder("ticket")
      .where("ticket.status = :status", { status: TicketStatus.RESOLVED })
      .andWhere("ticket.resolution IS NOT NULL") // Must have resolution for RAG
      .andWhere("ticket.resolution != ''")
      .orderBy("ticket.created_at", "ASC")
      .getMany();

    console.log(`   ✅ Found ${tickets.length} RESOLVED tickets\n`);

    if (tickets.length === 0) {
      console.log("⚠️  No RESOLVED tickets found. Run seed-database.ts first.");
      await AppDataSource.destroy();
      return;
    }

    // Validate resolutions quality
    const withDetailedResolutions = tickets.filter(
      (t) => t.resolution && t.resolution.length > 50,
    );

    console.log("📊 Resolution quality statistics:");
    console.log(`   Total RESOLVED: ${tickets.length}`);
    console.log(
      `   With detailed resolutions (>50 chars): ${withDetailedResolutions.length}`,
    );
    console.log(
      `   With generic resolutions: ${tickets.length - withDetailedResolutions.length}`,
    );
    console.log("");

    // Convert to minimal format (only fields needed for RAG Agent)
    const ticketsData = tickets.map((ticket) => ({
      // Required for Pinecone
      id: ticket.id, // Vector ID

      // For embedding generation (used in seed-tickets.ts)
      subject: ticket.subject,
      body: ticket.body,
      category: ticket.category || null,

      // Metadata (returned by Agent 5 after search)
      resolution: ticket.resolution, // HOW IT WAS SOLVED (critical!)
      priority: ticket.priority || null, // For Priority Agent boost
      time_to_resolve_minutes: ticket.time_to_resolve_minutes || null, // Time estimate
    }));

    // Save to JSON file
    const outputPath = path.resolve(__dirname, "../data", options.filename);
    fs.writeFileSync(outputPath, JSON.stringify(ticketsData, null, 2), "utf-8");

    console.log("✅ Export completed successfully!");
    console.log(`📁 File: data/${options.filename}`);
    console.log(`📊 Total tickets: ${ticketsData.length}`);
    console.log("");

    // Show sample resolution
    const sampleTicket = ticketsData[0];
    console.log("📝 Sample ticket:");
    console.log(`   Category: ${sampleTicket.category}`);
    console.log(`   Subject: ${sampleTicket.subject}`);
    console.log(
      `   Resolution: ${sampleTicket.resolution?.substring(0, 100)}...`,
    );
    console.log("");

    console.log("🎯 Next steps:");
    console.log("   1. Review data/tickets-resolved-*.json file");
    console.log("   2. Run: npm run seed:tickets (create this script next)");
    console.log(
      "   3. Verify Pinecone index has vectors in 'support-tickets' namespace",
    );

    // Close connection
    await AppDataSource.destroy();
  } catch (error) {
    console.error("\n💥 Error during export:", error);

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }

    process.exit(1);
  }
}

// Run export
exportResolvedTickets();
