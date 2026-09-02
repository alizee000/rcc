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

export const getBookingById = query({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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
        
        // Fetch invites sent for this booking
        const sentInvitesRaw = await ctx.db
          .query("bookingInvites")
          .withIndex("by_booking", (q) => q.eq("bookingId", b._id))
          .collect();
          
        const sentInvites = await Promise.all(
          sentInvitesRaw.map(async (inv) => {
            const invitee = await ctx.db
              .query("users")
              .filter((q) => q.eq(q.field("clerkId"), inv.inviteeId))
              .first();
            return {
              id: inv._id,
              status: inv.status,
              inviteeName: invitee ? invitee.name : "Unknown Racer",
            };
          })
        );

        const existingMeetup = await ctx.db
          .query("meetups")
          .withIndex("by_bookingId", (q) => q.eq("bookingId", b._id))
          .first();

        return {
          ...b,
          id: b._id,
          venue: venue ? { name: venue.name, imageUrl: venue.imageUrl } : null,
          experience: experience ? { name: experience.name } : null,
          sentInvites,
          hasMeetup: !!existingMeetup,
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
    makeMeetup: v.optional(v.boolean()),
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

    if (args.makeMeetup) {
      // Find the user's name or fallback to "Driver"
      const users = await ctx.db.query("users").collect();
      // Users in our DB might not have clerkId field mapped nicely, but we can try filtering or just default.
      // Wait, let's just default to "A Driver" for now, or if we can find the user.
      const hostUser = users.find(u => u.clerkId === args.userId || u._id === args.userId);
      const userName = hostUser?.name || "A Driver";
      
      const meetupId = await ctx.db.insert("meetups", {
        title: `${userName}'s Track Session`,
        description: "Join me for an RC racing session! Open to all skill levels.",
        date: args.date,
        time: args.time,
        venueId: args.venueId,
        hostId: args.userId,
        maxPlayers: 10,
        skillLevel: "All Levels",
        status: "OPEN",
        createdAt: Date.now(),
      });
      
      await ctx.db.insert("meetupParticipants", {
        meetupId,
        userId: args.userId,
        status: "JOINED",
        joinedAt: Date.now(),
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
      
      const booking = await ctx.db.get(args.bookingId);
      if (booking) {
        const venue = await ctx.db.get(booking.venueId);
        let user = await ctx.db.query("users").filter(q => q.eq(q.field("clerkId"), args.inviterId)).first();
        const userName = user ? user.name : "A racer";
        
        await ctx.db.insert("notifications", {
          userId: args.inviteeId,
          title: "Booking Invite",
          message: `${userName} invited you to a race session at ${venue?.name || 'a track'}.`,
          link: `/bookings`,
          isRead: false,
          createdAt: Date.now(),
        });
      }
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
export const getBookingMessages = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("bookingMessages")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .collect();

    return await Promise.all(
      messages.map(async (msg) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), msg.userId))
          .first();
        return {
          ...msg,
          user: user ? { name: user.name } : { name: "A Racer" },
        };
      })
    );
  },
});

export const sendBookingMessage = mutation({
  args: {
    bookingId: v.id("bookings"),
    userId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("bookingMessages", {
      bookingId: args.bookingId,
      userId: args.userId,
      text: args.text,
      createdAt: Date.now(),
    });
    return { success: true };
  },
});
