import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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

export const getUserBookings = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const myBookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
      
    const myInvites = await ctx.db
      .query("bookingInvites")
      .withIndex("by_invitee", (q) => q.eq("inviteeId", args.userId))
      .filter((q) => q.eq(q.field("status"), "ACCEPTED"))
      .collect();
      
    const invitedBookings = await Promise.all(
      myInvites.map(async (inv) => {
        return await ctx.db.get(inv.bookingId);
      })
    );
    
    // Combine and deduplicate just in case
    const allBookings = [...myBookings, ...invitedBookings.filter(b => b !== null)] as any[];
    
    // Sort by createdAt descending
    allBookings.sort((a, b) => b.createdAt - a.createdAt);
    
    return await Promise.all(
      allBookings.map(async (b) => {
        const venue = await ctx.db.get(b.venueId as Id<"venues">);
        const experience = await ctx.db.get(b.experienceId as Id<"experiences">);
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
    userId: v.string(),
    venueId: v.id("venues"),
    experienceId: v.id("experiences"),
    slotId: v.string(),
    date: v.string(), // ISO String
    time: v.string(), // e.g., "10:00 - 12:00"
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
      slotId: args.slotId as any,
      date: args.date,
      time: args.time,
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

    if (!args.slotId.startsWith("mock-")) {
      const slotId = args.slotId as Id<"availabilitySlots">;
      const slot = await ctx.db.get(slotId);
      if (slot) {
        await ctx.db.patch(slotId, {
          bookedCount: slot.bookedCount + args.players.length,
        });
      }
    }

    return { id: bookingId, qrCode };
  },
});

export const inviteToBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    inviterId: v.string(),
    inviteeId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if participant already exists
    const existing = await ctx.db
      .query("bookingInvites")
      .withIndex("by_booking_invitee", (q) => q.eq("bookingId", args.bookingId).eq("inviteeId", args.inviteeId))
      .first();

    if (existing) {
      if (existing.status !== "INVITED" && existing.status !== "ACCEPTED") {
        await ctx.db.patch(existing._id, { status: "PENDING" });
      }
    } else {
      await ctx.db.insert("bookingInvites", {
        bookingId: args.bookingId,
        inviterId: args.inviterId,
        inviteeId: args.inviteeId,
        status: "PENDING",
        invitedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const acceptBookingInvite = mutation({
  args: {
    inviteId: v.id("bookingInvites"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.inviteId, { status: "ACCEPTED" });
    return { success: true };
  },
});

export const declineBookingInvite = mutation({
  args: {
    inviteId: v.id("bookingInvites"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.inviteId, { status: "DECLINED" });
    return { success: true };
  },
});

export const getUserBookingInvites = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const invites = await ctx.db
      .query("bookingInvites")
      .withIndex("by_invitee", (q) => q.eq("inviteeId", args.userId))
      .filter((q) => q.eq(q.field("status"), "PENDING"))
      .order("desc")
      .collect();
      
    return await Promise.all(
      invites.map(async (inv) => {
        const booking = await ctx.db.get(inv.bookingId);
        if (!booking) return null;
        
        const venue = await ctx.db.get(booking.venueId);
        const experience = await ctx.db.get(booking.experienceId);
        
        // Fetch inviter info if we stored it in the users table
        const inviter = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), inv.inviterId))
          .first();
          
        return {
          ...inv,
          booking: {
            ...booking,
            venue: venue ? { name: venue.name, city: venue.city } : null,
            experience: experience ? { name: experience.name } : null,
          },
          inviter: inviter ? { name: inviter.name } : { name: "A Racer" }
        };
      })
    ).then(res => res.filter(r => r !== null));
  },
});
