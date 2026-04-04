import * as fs from "fs";
import * as path from "path";

import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

interface Product {
  id: string; // UUID
  sku: string;
  name: string;
  category: string;
  price: number;
  specs: Record<string, any>;
  compatibility: string[];
  inventory_count: number;
  images: string[];
  created_at: string;
}

interface ProductCategory {
  name: string;
  prefixes: string[];
  brands: string[];
  models: string[];
  priceRange: { min: number; max: number };
  specs: () => Record<string, any>;
  compatibility: string[];
}

interface GenerateOptions {
  filename: string;
  count: number;
}

const categories: ProductCategory[] = [
  {
    name: "Smartphones",
    prefixes: ["SM", "PH", "IP"],
    brands: ["TechPro", "SmartPhone Inc", "MobileMax", "PhonePlus"],
    models: ["X", "Pro", "Ultra", "Max", "Plus", "Elite", "Prime"],
    priceRange: { min: 299, max: 1299 },
    specs: () => ({
      screen: `${faker.number.float({ min: 5.5, max: 6.8, fractionDigits: 1 })}"`,
      storage: faker.helpers.arrayElement(["64GB", "128GB", "256GB", "512GB"]),
      ram: faker.helpers.arrayElement(["4GB", "6GB", "8GB", "12GB"]),
      battery: `${faker.number.int({ min: 3000, max: 5000 })}mAh`,
      camera: `${faker.number.int({ min: 12, max: 108 })}MP`,
    }),
    compatibility: ["5G", "4G", "WiFi 6", "Bluetooth 5.0", "USB-C"],
  },
  {
    name: "Laptops",
    prefixes: ["LP", "NB", "UL"],
    brands: ["CompuMax", "TechBook", "ProLaptop", "PowerPC"],
    models: ["Book", "Pro", "Air", "Studio", "Elite", "Business"],
    priceRange: { min: 599, max: 2499 },
    specs: () => ({
      processor: faker.helpers.arrayElement([
        "Intel i5",
        "Intel i7",
        "Intel i9",
        "AMD Ryzen 5",
        "AMD Ryzen 7",
      ]),
      ram: faker.helpers.arrayElement(["8GB", "16GB", "32GB", "64GB"]),
      storage: faker.helpers.arrayElement([
        "256GB SSD",
        "512GB SSD",
        "1TB SSD",
        "2TB SSD",
      ]),
      screen: `${faker.number.int({ min: 13, max: 17 })}"`,
      graphics: faker.helpers.arrayElement([
        "Integrated",
        "NVIDIA GTX",
        "NVIDIA RTX",
        "AMD Radeon",
      ]),
    }),
    compatibility: ["Windows 11", "USB-C", "HDMI", "WiFi 6", "Bluetooth 5.0"],
  },
  {
    name: "Headphones",
    prefixes: ["HP", "AH", "WH"],
    brands: ["AudioMax", "SoundPro", "BeatMaster", "ListenUp"],
    models: ["Wave", "Beat", "Sound", "Pro", "Elite", "Studio"],
    priceRange: { min: 49, max: 399 },
    specs: () => ({
      type: faker.helpers.arrayElement(["Over-ear", "In-ear", "On-ear"]),
      wireless: faker.datatype.boolean(),
      noiseCancellation: faker.datatype.boolean(),
      batteryLife: `${faker.number.int({ min: 10, max: 40 })}h`,
      impedance: `${faker.number.int({ min: 16, max: 80 })}Ω`,
    }),
    compatibility: ["Bluetooth 5.0", "3.5mm Jack", "USB-C", "iOS", "Android"],
  },
  {
    name: "Tablets",
    prefixes: ["TB", "PD", "SL"],
    brands: ["TabletPro", "SlateMax", "PadPlus", "TouchBook"],
    models: ["Tab", "Pad", "Slate", "Pro", "Air", "Mini"],
    priceRange: { min: 199, max: 999 },
    specs: () => ({
      screen: `${faker.number.float({ min: 8, max: 13, fractionDigits: 1 })}"`,
      storage: faker.helpers.arrayElement(["32GB", "64GB", "128GB", "256GB"]),
      ram: faker.helpers.arrayElement(["2GB", "4GB", "6GB", "8GB"]),
      battery: `${faker.number.int({ min: 5000, max: 10000 })}mAh`,
      camera: `${faker.number.int({ min: 8, max: 12 })}MP`,
    }),
    compatibility: ["WiFi 6", "Bluetooth 5.0", "USB-C", "Stylus Support"],
  },
  {
    name: "Smartwatches",
    prefixes: ["SW", "WT", "SM"],
    brands: ["WatchPro", "TimeMax", "SmartTime", "FitWatch"],
    models: ["Watch", "Fit", "Active", "Pro", "Sport", "Elite"],
    priceRange: { min: 99, max: 599 },
    specs: () => ({
      screen: `${faker.number.float({ min: 1.2, max: 1.9, fractionDigits: 1 })}"`,
      batteryLife: `${faker.number.int({ min: 1, max: 7 })} days`,
      waterResistance: faker.helpers.arrayElement([
        "IP67",
        "IP68",
        "5ATM",
        "10ATM",
      ]),
      sensors: faker.helpers.arrayElements(
        ["Heart Rate", "GPS", "Accelerometer", "Gyroscope", "SpO2"],
        3,
      ),
    }),
    compatibility: ["iOS", "Android", "Bluetooth 5.0", "WiFi"],
  },
  {
    name: "Keyboards",
    prefixes: ["KB", "MK", "KY"],
    brands: ["KeyPro", "TypeMax", "MechBoard", "KeyMaster"],
    models: ["Pro", "Mech", "Elite", "Gaming", "Office", "Compact"],
    priceRange: { min: 29, max: 199 },
    specs: () => ({
      type: faker.helpers.arrayElement(["Mechanical", "Membrane", "Wireless"]),
      switches: faker.helpers.arrayElement([
        "Cherry MX Red",
        "Cherry MX Blue",
        "Cherry MX Brown",
        "Membrane",
      ]),
      backlight: faker.helpers.arrayElement(["RGB", "White", "None"]),
      layout: faker.helpers.arrayElement(["Full-size", "TKL", "60%", "75%"]),
    }),
    compatibility: ["USB", "Bluetooth", "Windows", "Mac", "Linux"],
  },
];

function parseArguments(): GenerateOptions {
  const args = process.argv.slice(2);

  const fileArg = args.find((arg) => arg.startsWith("--file="));
  const filename = fileArg
    ? fileArg.split("=")[1]
    : `products-${new Date().toISOString().split("T")[0]}.json`;

  const countArg = args.find((arg) => arg.startsWith("--count="));
  const count = countArg ? parseInt(countArg.split("=")[1], 10) : 50;

  return { filename, count };
}

function generateSKU(category: ProductCategory, index: number): string {
  const prefix = faker.helpers.arrayElement(category.prefixes);
  const year = new Date().getFullYear().toString().slice(-2);
  const num = String(index).padStart(4, "0");
  return `${prefix}-${year}-${num}`;
}

function generateProduct(category: ProductCategory, index: number): Product {
  const id = uuidv4();
  const brand = faker.helpers.arrayElement(category.brands);
  const model = faker.helpers.arrayElement(category.models);
  const name = `${brand} ${model} ${faker.number.int({ min: 100, max: 999 })}`;
  const sku = generateSKU(category, index);
  const price = parseFloat(
    faker.number
      .float({
        min: category.priceRange.min,
        max: category.priceRange.max,
        fractionDigits: 2,
      })
      .toFixed(2),
  );
  const specs = category.specs();
  const compatibility = faker.helpers.arrayElements(
    category.compatibility,
    faker.number.int({ min: 2, max: category.compatibility.length }),
  );
  const inventory_count = faker.number.int({ min: 0, max: 500 });
  const images = Array.from(
    { length: faker.number.int({ min: 1, max: 4 }) },
    () => faker.image.urlLoremFlickr({ category: category.name.toLowerCase() }),
  );
  const created_at = faker.date.past({ years: 2 }).toISOString();

  return {
    id,
    sku,
    name,
    category: category.name,
    price,
    specs,
    compatibility,
    inventory_count,
    images,
    created_at,
  };
}

function generateProducts(options: GenerateOptions): Product[] {
  const { count } = options;
  const products: Product[] = [];
  const productsPerCategory = Math.ceil(count / categories.length);

  let productIndex = 1;

  for (const category of categories) {
    const productsToGenerate = Math.min(
      productsPerCategory,
      count - products.length,
    );

    for (let i = 0; i < productsToGenerate; i++) {
      products.push(generateProduct(category, productIndex));
      productIndex++;
    }

    if (products.length >= count) break;
  }

  return products.slice(0, count);
}

// Main execution
const options = parseArguments();
const products = generateProducts(options);
const outputPath = path.resolve(__dirname, "../data", options.filename);

// Ensure data directory exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), "utf-8");

console.log(`✅ Generated ${products.length} products`);
console.log(`📂 File saved to: ${outputPath}`);
console.log(`📊 Categories: ${categories.map((c) => c.name).join(", ")}`);
console.log(`\nUsage examples:`);
console.log(`  npm run generate:products -- --file=products.json --count=50`);
console.log(`  npm run generate:products -- --count=100`);
