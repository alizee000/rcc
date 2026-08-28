import prisma from "@/lib/prisma";
import ExploreView from "@/components/ExploreView";

export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const venues = await prisma.venue.findMany({
    include: {
      experiences: true,
      tracks: true,
      cars: true
    }
  });

  return <ExploreView venues={venues} />;
}
