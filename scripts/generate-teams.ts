import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

interface Team {
  id: string; // UUID
  name: string;
  members: string[]; // simple-array
  slack_channel: string | null;
  availability_hours: string | null;
}

interface GenerateOptions {
  filename: string;
}

const teamConfigs = [
  {
    name: "Technical Support",
    members: [
      "John Smith",
      "Sarah Johnson",
      "Mike Chen",
      "Emily Davis",
      "Alex Kumar",
    ],
    slack_channel: "#tech-support",
    availability_hours: "24/7",
  },
  {
    name: "Billing & Payments",
    members: ["Lisa Anderson", "Tom Wilson", "Maria Garcia", "James Brown"],
    slack_channel: "#billing-team",
    availability_hours: "9 AM - 6 PM EST",
  },
  {
    name: "Returns & Refunds",
    members: [
      "Patricia Martinez",
      "Robert Taylor",
      "Jennifer Lee",
      "David Kim",
    ],
    slack_channel: "#returns-team",
    availability_hours: "8 AM - 8 PM EST",
  },
  {
    name: "Product Issues",
    members: [
      "Michael Johnson",
      "Jessica Williams",
      "Chris Rodriguez",
      "Amanda Clark",
    ],
    slack_channel: "#product-issues",
    availability_hours: "24/7",
  },
  {
    name: "Shipping & Delivery",
    members: ["Daniel Lewis", "Nicole Walker", "Kevin Hall", "Rachel Allen"],
    slack_channel: "#shipping-team",
    availability_hours: "7 AM - 7 PM EST",
  },
  {
    name: "Account Management",
    members: ["Steven Young", "Laura King", "Brian Wright", "Michelle Scott"],
    slack_channel: "#account-mgmt",
    availability_hours: "9 AM - 5 PM EST",
  },
];

function parseArguments(): GenerateOptions {
  const args = process.argv.slice(2);

  const fileArg = args.find((arg) => arg.startsWith("--file="));
  const filename = fileArg
    ? fileArg.split("=")[1]
    : `teams-${new Date().toISOString().split("T")[0]}.json`;

  return { filename };
}

function generateTeams(): Team[] {
  return teamConfigs.map((config) => ({
    id: uuidv4(),
    name: config.name,
    members: config.members,
    slack_channel: config.slack_channel,
    availability_hours: config.availability_hours,
  }));
}

// Main execution
const options = parseArguments();
const teams = generateTeams();
const outputPath = path.resolve(__dirname, "../data", options.filename);

// Ensure data directory exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(teams, null, 2), "utf-8");

console.log(`✅ Generated ${teams.length} teams`);
console.log(`📂 File saved to: ${outputPath}`);
console.log(`\nTeams:`);
teams.forEach((team) => {
  console.log(`   - ${team.name} (${team.members.length} members)`);
});
console.log(`\nUsage:`);
console.log(`  tsx scripts/generate-teams.ts`);
console.log(`  tsx scripts/generate-teams.ts -- --file=teams.json`);
