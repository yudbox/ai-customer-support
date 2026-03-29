import * as fs from "fs";
import * as path from "path";
import { OpenAI } from "openai";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

/**
 * Скрипт для улучшения resolution в существующих тикетах
 * Использует OpenAI для генерации реалистичных решений на основе контекста тикета
 *
 * Usage:
 * npx tsx scripts/enhance-resolutions.ts --file=tickets-2026-03-24.json
 */

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  body: string;
  category: string | null;
  subcategory: string | null;
  status: string;
  resolution: string | null;
  [key: string]: any;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateRealisticResolution(ticket: Ticket): Promise<string> {
  const prompt = `You are a customer support manager writing a resolution for a resolved ticket.

Ticket Info:
- Subject: ${ticket.subject}
- Issue: ${ticket.body}
- Category: ${ticket.category}${ticket.subcategory ? ` → ${ticket.subcategory}` : ""}

Generate a realistic, detailed resolution that includes:
1. What the specific issue was
2. Root cause (if applicable)
3. What action was taken to resolve it
4. Any follow-up or prevention steps

Keep it professional, 2-4 sentences, specific to this ticket context.

Example good resolutions:
- "Customer's card was declined due to expired CVV. Updated payment method with new card ending in *4532. Transaction processed successfully ($125.50). Sent reminder to update payment info 30 days before expiration."
- "Checkout page crash caused by conflicting payment gateway scripts. Disabled deprecated Stripe v2 SDK, updated to v3. Issue resolved, customer completed purchase. Added monitoring for script conflicts."

Generate ONLY the resolution text, no extra formatting:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful customer support resolution writer. Generate concise, specific, actionable resolutions.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return (
      completion.choices[0]?.message?.content?.trim() ||
      "Issue resolved after thorough investigation and customer confirmation."
    );
  } catch (error) {
    console.error(
      `Error generating resolution for ${ticket.ticket_number}:`,
      error,
    );
    return ticket.resolution || "Issue resolved successfully.";
  }
}

async function enhanceResolutions(filename: string) {
  const filePath = path.resolve(__dirname, "../data", filename);

  console.log(`📖 Reading file: ${filePath}`);
  const tickets: Ticket[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const resolvedTickets = tickets.filter(
    (t) => (t.status === "resolved" || t.status === "closed") && t.resolution,
  );

  console.log(`✅ Found ${resolvedTickets.length} resolved/closed tickets`);
  console.log(`🤖 Generating realistic resolutions using OpenAI...`);
  console.log(
    `⏱️  This will take ~${Math.ceil((resolvedTickets.length * 2) / 60)} minutes\n`,
  );

  let processed = 0;
  const batchSize = 5; // Process in batches to avoid rate limits

  for (let i = 0; i < resolvedTickets.length; i += batchSize) {
    const batch = resolvedTickets.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (ticket) => {
        const newResolution = await generateRealisticResolution(ticket);
        ticket.resolution = newResolution;
        processed++;

        if (processed % 10 === 0) {
          console.log(
            `   [${processed}/${resolvedTickets.length}] ${ticket.ticket_number}: "${newResolution.substring(0, 60)}..."`,
          );
        }
      }),
    );

    // Small delay between batches
    if (i + batchSize < resolvedTickets.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n✅ All ${processed} resolutions generated!`);

  // Generate SQL migration file
  const sqlLines: string[] = [];
  sqlLines.push(
    "-- SQL Migration: Update resolutions for resolved/closed tickets",
  );
  sqlLines.push(`-- Generated: ${new Date().toISOString()}`);
  sqlLines.push(`-- Total updates: ${processed}`);
  sqlLines.push("");
  sqlLines.push("BEGIN;");
  sqlLines.push("");

  resolvedTickets.forEach((ticket) => {
    // Escape single quotes in resolution
    const escapedResolution = ticket.resolution!.replace(/'/g, "''");

    sqlLines.push(`-- Ticket: ${ticket.ticket_number} (${ticket.category})`);
    sqlLines.push(`UPDATE tickets`);
    sqlLines.push(`SET resolution = '${escapedResolution}'`);
    sqlLines.push(`WHERE id = '${ticket.id}';`);
    sqlLines.push("");
  });

  sqlLines.push("COMMIT;");
  sqlLines.push("");
  sqlLines.push(`-- Migration complete: ${processed} tickets updated`);

  const sqlPath = path.resolve(__dirname, "../data", "update-resolutions.sql");
  fs.writeFileSync(sqlPath, sqlLines.join("\n"));

  console.log(`💾 SQL migration file created: ${sqlPath}`);
  console.log(`\n📊 Statistics:`);
  console.log(`   - Total tickets: ${tickets.length}`);
  console.log(`   - Enhanced tickets: ${processed}`);
  console.log(`\n🚀 To apply migration to LOCAL database:`);
  console.log(`\n   Option 1 - Using psql directly:`);
  console.log(
    `   psql -h localhost -U postgres -d ai_customer_support -f data/update-resolutions.sql`,
  );
  console.log(`\n   Option 2 - Using Docker:`);
  console.log(
    `   docker exec -i ai-customer-support-db psql -U postgres -d ai_customer_support < data/update-resolutions.sql`,
  );
  console.log(
    `\n⚠️  For PRODUCTION, switch .env.local credentials and connect to Neon database.`,
  );
}

// Main execution
const args = process.argv.slice(2);
const fileArg = args.find((arg) => arg.startsWith("--file="));
const filename = fileArg ? fileArg.split("=")[1] : "tickets-2026-03-24.json";

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found in environment variables");
  process.exit(1);
}

enhanceResolutions(filename)
  .then(() => {
    console.log("\n🎉 Done! Run migration script to update database.");
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
