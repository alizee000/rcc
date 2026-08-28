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
        const user = await ctx.db.get(lap.userId);
        const car = lap.carId ? await ctx.db.get(lap.carId) : null;
        const track = await ctx.db.get(lap.trackId);
        
        return {
          ...lap,
          id: lap._id,
          user: user ? { id: user._id, name: user.name } : null,
          car: car ? { name: car.name } : null,
          track: track ? { name: track.name } : null,
        };
      })
    );
  },
});
