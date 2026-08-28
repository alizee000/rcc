import ExploreView from "@/components/ExploreView";
import { fetchQuery } from "convex/nextjs";
// @ts-ignore
import { api } from "../../../convex/_generated/api";

export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const venues = await fetchQuery(api.venues.getVenues);

  return <ExploreView venues={venues} />;
}
