import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function main() {
  console.log("Running seed mutation...");
  const result = await client.mutation(api.seedCategories.default);
  console.log("Done:", result);
}
main();
