import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";

/**
 * ⚠️ BEFORE RUNNING THIS SCRIPT:
 * 1. Ensure .env.local has OPENAI_API_KEY and PINECONE_API_KEY
 * 2. Verify PINECONE_NAMESPACE=support-tickets in .env.local
 * 3. Run export-resolved-tickets.ts first to generate data file
 * 4. Check that tickets-resolved-*.json exists in data/ folder
 */

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME =
  process.env.PINECONE_INDEX_NAME || "module2-embeddings";
const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || "support-tickets";

interface Ticket {
  id: string;
  subject: string;
  body: string;
  category: string | null;
  resolution: string;
  priority: string | null;
  time_to_resolve_minutes: number | null;
}

// Pinecone metadata type - all fields are required except category which is conditionally added
type PineconeMetadata = Record<string, string | number>;

// Sleep utility for rate limiting
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Parse command line arguments
function parseArguments(): { filename: string } {
  const args = process.argv.slice(2);

  // Parse --file argument (default: tickets-resolved-2026-03-28.json)
  const fileArg = args.find((arg) => arg.startsWith("--file="));
  const filename = fileArg
    ? fileArg.split("=")[1]
    : "tickets-resolved-2026-03-28.json";

  return { filename };
}

async function generateEmbedding(
  openai: OpenAI,
  text: string,
): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating embedding:", error);
    throw error;
  }
}

async function seedTickets() {
  // Validate environment variables
  if (!OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY not found in .env.local");
    console.log(
      "\n📝 Get your OpenAI API key from: https://platform.openai.com/api-keys",
    );
    process.exit(1);
  }

  if (!PINECONE_API_KEY) {
    console.error("❌ PINECONE_API_KEY not found in .env.local");
    console.log(
      "\n📝 Get your Pinecone API key from: https://app.pinecone.io/",
    );
    process.exit(1);
  }

  console.log("🚀 Starting Pinecone ticket migration...\n");

  const { filename } = parseArguments();

  // Initialize clients
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

  // Read specified tickets file
  const ticketsPath = path.join(process.cwd(), "data", filename);

  if (!fs.existsSync(ticketsPath)) {
    console.error(`❌ File not found: ${ticketsPath}`);
    console.error(
      `\n💡 Run this first: npx tsx scripts/export-resolved-tickets.ts`,
    );
    process.exit(1);
  }

  const ticketsData = fs.readFileSync(ticketsPath, "utf-8");
  const allTickets: Ticket[] = JSON.parse(ticketsData);

  console.log(`🎫 Found ${allTickets.length} resolved tickets in JSON\n`);

  // Get or create index
  console.log(`📍 Connecting to Pinecone index: ${PINECONE_INDEX_NAME}...`);
  const index = pinecone.index(PINECONE_INDEX_NAME);

  // Use namespace from .env.local
  const namespace = index.namespace(PINECONE_NAMESPACE);

  console.log(`✅ Connected to Pinecone namespace: "${PINECONE_NAMESPACE}"\n`);

  // Check existing vectors in Pinecone
  const existingIds = new Set<string>();

  console.log("🔍 Fetching existing ticket IDs from Pinecone...");

  try {
    const allTicketIds = new Set(allTickets.map((t) => t.id));
    const ticketIdsArray = Array.from(allTicketIds);
    const FETCH_BATCH_SIZE = 100;

    for (let i = 0; i < ticketIdsArray.length; i += FETCH_BATCH_SIZE) {
      const batchIds = ticketIdsArray.slice(i, i + FETCH_BATCH_SIZE);

      try {
        const result = await namespace.fetch({ ids: batchIds });

        if (result.records) {
          Object.keys(result.records).forEach((id) => existingIds.add(id));
        }
      } catch (error) {
        console.warn(
          `⚠️  Could not fetch batch ${Math.floor(i / FETCH_BATCH_SIZE) + 1}:`,
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    }

    console.log(`✅ Found ${existingIds.size} existing vectors in Pinecone`);
    if (existingIds.size > 0) {
      console.log(
        `📝 Existing IDs: ${Array.from(existingIds).slice(0, 5).join(", ")}${existingIds.size > 5 ? "..." : ""}\n`,
      );
    } else {
      console.log("📝 No existing vectors found - will migrate all tickets\n");
    }
  } catch (error) {
    console.log(
      "⚠️  Could not check existing vectors, will attempt to upsert all\n",
    );
  }

  // Filter tickets to only those not in Pinecone
  const ticketsToMigrate = allTickets.filter((t) => !existingIds.has(t.id));

  if (ticketsToMigrate.length === 0) {
    console.log(
      "✅ All tickets are already in Pinecone! Nothing to migrate.\n",
    );
    return;
  }

  console.log(
    `🎯 Tickets to migrate: ${ticketsToMigrate.length} (${existingIds.size} already exist)\n`,
  );

  let successCount = 0;
  let failedCount = 0;
  const failedTickets: string[] = [];

  // Process tickets in batches
  const BATCH_SIZE = 10;

  for (let i = 0; i < ticketsToMigrate.length; i += BATCH_SIZE) {
    const batch = ticketsToMigrate.slice(i, i + BATCH_SIZE);

    console.log(
      `\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(ticketsToMigrate.length / BATCH_SIZE)}...`,
    );

    // Generate embeddings for batch
    const vectors = [];

    for (const ticket of batch) {
      try {
        console.log(
          `  [${i + batch.indexOf(ticket) + 1}/${ticketsToMigrate.length}] ${ticket.subject.substring(0, 50)}...`,
        );

        // CRITICAL: Create embedding from subject + body + category ONLY
        // DO NOT include resolution! (new tickets don't have resolution yet)
        const embeddingText = `${ticket.subject}. ${ticket.body}${ticket.category ? `. Category: ${ticket.category}` : ""}.`;

        // Generate embedding
        const embedding = await generateEmbedding(openai, embeddingText);

        // Prepare metadata (Pinecone metadata must be flat)
        const metadata: PineconeMetadata = {
          subject: ticket.subject,
          resolution: ticket.resolution,
          priority: ticket.priority || "medium",
          time_to_resolve_minutes: ticket.time_to_resolve_minutes ?? 0,
        };

        // Conditionally add category if it exists (Pinecone doesn't accept undefined)
        if (ticket.category) {
          metadata.category = ticket.category;
        }

        vectors.push({
          id: ticket.id,
          values: embedding,
          metadata,
        });

        console.log(
          `    ✅ Embedding generated (${embedding.length} dimensions)`,
        );

        // Rate limiting for OpenAI API (3 requests per second max)
        if (batch.indexOf(ticket) < batch.length - 1) {
          await sleep(350); // ~3 requests/second
        }

        successCount++;
      } catch (error) {
        failedCount++;
        failedTickets.push(ticket.id);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        console.error(`    ❌ Failed: ${errorMessage}`);
      }
    }

    // Upsert batch to Pinecone
    if (vectors.length > 0) {
      try {
        console.log(
          `\n  📤 Upserting ${vectors.length} vectors to Pinecone...`,
        );
        await namespace.upsert({
          records: vectors,
        });
        console.log(`  ✅ Batch upserted successfully`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        console.error(`  ❌ Failed to upsert batch: ${errorMessage}`);
      }
    }

    // Small delay between batches
    if (i + BATCH_SIZE < ticketsToMigrate.length) {
      await sleep(1000);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("✨ Migration Complete!");
  console.log("=".repeat(60));

  const totalInPinecone = successCount + existingIds.size;

  if (existingIds.size > 0) {
    console.log(`📊 Already existed: ${existingIds.size} tickets`);
  }
  console.log(`✅ Successfully migrated: ${successCount} tickets`);

  if (failedCount > 0) {
    console.log(`❌ Failed: ${failedCount} tickets`);
    console.log(`\nFailed ticket IDs: ${failedTickets.join(", ")}`);
  }

  console.log(`\n📊 Pinecone Index: ${PINECONE_INDEX_NAME}`);
  console.log(`📍 Namespace: ${PINECONE_NAMESPACE}`);
  console.log(
    `📍 Total vectors in namespace: ${totalInPinecone} (${existingIds.size} existed + ${successCount} new)`,
  );
  console.log(
    `💰 Estimated cost (this run): ~$${(successCount * 0.00002).toFixed(4)} (OpenAI embeddings)`,
  );

  console.log(
    "\n🎉 Migration successful! RAG Agent (Agent 5) can now search similar resolved tickets.",
  );

  console.log(`\n💡 Next steps:`);
  console.log(
    `   1. Implement Agent 5 RAG Node (lib/langgraph/agentNodes/ragNode.ts)`,
  );
  console.log(
    `   2. Query Pinecone for similar tickets based on new ticket description`,
  );
  console.log(`   3. Return resolution suggestions to Agent 6`);
}

// Run the script
seedTickets().catch((error) => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});
