import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBookings = query({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").collect();
    
    return await Promise.all(
      bookings.map(async (b) => {
        const venue = await ctx.db.get(b.venueId);
        const experience = await ctx.db.get(b.experienceId);
        return {
          ...b,
          id: b._id,
          venue: venue ? { name: venue.name, imageUrl: venue.imageUrl } : null,
          experience: experience ? { name: experience.name } : null,
        };
      })
    );
  },
});

export const createBooking = mutation({
  args: {
    userId: v.id("users"),
    venueId: v.id("venues"),
    experienceId: v.id("experiences"),
    slotId: v.id("availabilitySlots"),
    date: v.string(), // ISO String
    totalPrice: v.number(),
    players: v.array(
      v.object({
        name: v.string(),
        age: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const qrCode = `RC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const bookingId = await ctx.db.insert("bookings", {
      userId: args.userId,
      venueId: args.venueId,
      experienceId: args.experienceId,
      slotId: args.slotId,
      date: args.date,
      status: "CONFIRMED",
      totalPrice: args.totalPrice,
      qrCode,
      createdAt: Date.now(),
    });

    for (const player of args.players) {
      await ctx.db.insert("bookingPlayers", {
        bookingId,
        name: player.name,
        age: player.age,
      });
    }

    const slot = await ctx.db.get(args.slotId);
    if (slot) {
      await ctx.db.patch(args.slotId, {
        bookedCount: slot.bookedCount + args.players.length,
      });
    }

    return { id: bookingId, qrCode };
  },
});
