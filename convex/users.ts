import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Usually Clerk accounts might not have identical IDs across recreations, so we check email
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { name: args.name, clerkId: args.clerkId });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      role: "USER",
      createdAt: Date.now(),
    });
  },
});

export const getDriverProfile = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    let user = null;
    try {
      user = await ctx.db.get(args.id as any);
    } catch(e) {}
    
    if (!user) {
      user = await ctx.db.query("users").filter(q => q.eq(q.field("clerkId"), args.id)).first();
    }
    
    if (!user) return null;

    // fetch lap times
    let lapTimes = await ctx.db.query("lapTimes").filter(q => q.eq(q.field("userId"), args.id)).collect();
    // if userId was stored as _id, we must also check that
    if (lapTimes.length === 0 && user._id !== args.id) {
       lapTimes = await ctx.db.query("lapTimes").filter(q => q.eq(q.field("userId"), user!._id)).collect();
    }

    lapTimes.sort((a, b) => a.timeMs - b.timeMs);
    const top5 = lapTimes.slice(0, 5);

    const populatedLaps = await Promise.all(
      top5.map(async (lap) => {
        const car = lap.carId ? await ctx.db.get(lap.carId) : null;
        const track = await ctx.db.get(lap.trackId);
        const venue = track ? await ctx.db.get(track.venueId) : null;

        return {
          ...lap,
          id: lap._id,
          car: car ? { name: car.name } : null,
          track: track ? { name: track.name, venue: venue ? { name: venue.name } : { name: "Unknown" } } : { name: "Unknown", venue: { name: "Unknown" } },
        };
      })
    );

    return {
      ...user,
      id: user._id,
      lapTimes: populatedLaps
    };
  }
});
