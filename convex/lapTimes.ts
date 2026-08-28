import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getLeaderboards = query({
  args: {},
  handler: async (ctx) => {
    // For MVP, we get all lap times and sort them.
    // In production with lots of records, we'd index this better.
    const lapTimes = await ctx.db.query("lapTimes").collect();
    lapTimes.sort((a, b) => a.timeMs - b.timeMs);
    
    // Get the top 10
    const top10 = lapTimes.slice(0, 10);
    
    return await Promise.all(
      top10.map(async (lap) => {
        const user = null; // We don't fetch Clerk users from DB
        const car = lap.carId ? await ctx.db.get(lap.carId) : null;
        const track = await ctx.db.get(lap.trackId);
        
        return {
          ...lap,
          id: lap._id,
          user: { id: lap.userId, name: "Racer" },
          car: car ? { name: car.name } : null,
          track: track ? { name: track.name } : null,
        };
      })
    );
  },
});
