import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getMeetups = query({
  args: {},
  handler: async (ctx) => {
    const meetups = await ctx.db.query("meetups").order("asc").collect();
    
    // Fetch related data for each meetup
    const meetupsWithRelations = await Promise.all(
      meetups.map(async (meetup) => {
        const host = null; // Clerk user, we don't fetch from Convex DB
        const venue = await ctx.db.get(meetup.venueId);
        const participants = await ctx.db
          .query("meetupParticipants")
          .withIndex("by_meetup", (q) => q.eq("meetupId", meetup._id))
          .collect();

        return {
          ...meetup,
          id: meetup._id,
          host: { id: meetup.hostId, name: "Host Player" }, // Mock host for now
          venue: venue ? { id: venue._id, name: venue.name, city: venue.city, imageUrl: venue.imageUrl } : null,
          participants: participants.map(p => ({ userId: p.userId, status: p.status })),
        };
      })
    );

    return meetupsWithRelations;
  },
});

export const getMeetupById = query({
  args: { id: v.id("meetups") },
  handler: async (ctx, args) => {
    const meetup = await ctx.db.get(args.id);
    if (!meetup) return null;

    const host = null;
    const venue = await ctx.db.get(meetup.venueId);
    
    const participantDocs = await ctx.db
      .query("meetupParticipants")
      .withIndex("by_meetup", (q) => q.eq("meetupId", meetup._id))
      .collect();

    const participants = await Promise.all(
      participantDocs.map(async (p) => {
        const user = null;
        return {
          ...p,
          id: p._id,
          user: { id: p.userId, name: "Racer", email: "" },
        };
      })
    );

    return {
      ...meetup,
      id: meetup._id,
      host: { id: meetup.hostId, name: "Host Player", email: "" },
      venue: venue ? { id: venue._id, name: venue.name, city: venue.city, imageUrl: venue.imageUrl, address: venue.address } : null,
      participants,
    };
  },
});

export const createMeetup = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    venueId: v.id("venues"),
    date: v.string(),
    time: v.string(),
    maxPlayers: v.number(),
    skillLevel: v.string(),
    hostId: v.string(), // We will pass this from the client session
    invitedUserIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const meetupId = await ctx.db.insert("meetups", {
      title: args.title,
      description: args.description,
      venueId: args.venueId,
      date: args.date,
      time: args.time,
      maxPlayers: args.maxPlayers,
      skillLevel: args.skillLevel,
      hostId: args.hostId,
      status: "OPEN",
      createdAt: Date.now(),
    });

    // Create participant record for host
    await ctx.db.insert("meetupParticipants", {
      meetupId,
      userId: args.hostId,
      status: "JOINED",
      joinedAt: Date.now(),
    });

    // Create participant records for invited users
    for (const userId of args.invitedUserIds) {
      await ctx.db.insert("meetupParticipants", {
        meetupId,
        userId,
        status: "INVITED",
        joinedAt: Date.now(),
      });
    }

    return { id: meetupId };
  },
});

export const joinMeetup = mutation({
  args: { 
    meetupId: v.id("meetups"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("meetupParticipants")
      .withIndex("by_meetup_user", (q) => q.eq("meetupId", args.meetupId).eq("userId", args.userId))
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, { status: "JOINED" });
    } else {
      await ctx.db.insert("meetupParticipants", {
        meetupId: args.meetupId,
        userId: args.userId,
        status: "PENDING",
        joinedAt: Date.now(),
      });
      
      const meetup = await ctx.db.get(args.meetupId);
      if (meetup && meetup.hostId !== args.userId) {
        let user = await ctx.db.query("users").filter(q => q.eq(q.field("clerkId"), args.userId)).first();
        const userName = user ? user.name : "A racer";
        await ctx.db.insert("notifications", {
          userId: meetup.hostId,
          title: "New Meetup Request",
          message: `${userName} has requested to join your meetup: ${meetup.title}`,
          link: `/meetups/${args.meetupId}`,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

export const approveJoinRequest = mutation({
  args: {
    participantId: v.id("meetupParticipants"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.participantId, { status: "JOINED" });
    const participant = await ctx.db.get(args.participantId);
    if (participant) {
      const meetup = await ctx.db.get(participant.meetupId);
      if (meetup) {
        await ctx.db.insert("notifications", {
          userId: participant.userId,
          title: "Request Approved",
          message: `Your request to join ${meetup.title} has been approved!`,
          link: `/meetups/${meetup._id}`,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }
    return { success: true };
  },
});

export const declineJoinRequest = mutation({
  args: {
    participantId: v.id("meetupParticipants"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.participantId, { status: "DECLINED" });
    return { success: true };
  },
});

export const inviteToMeetup = mutation({
  args: {
    meetupId: v.id("meetups"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if participant already exists
    const existing = await ctx.db
      .query("meetupParticipants")
      .withIndex("by_meetup_user", (q) => q.eq("meetupId", args.meetupId).eq("userId", args.userId))
      .first();

    if (existing) {
      if (existing.status !== "INVITED" && existing.status !== "JOINED") {
        await ctx.db.patch(existing._id, { status: "INVITED" });
      }
    } else {
      await ctx.db.insert("meetupParticipants", {
        meetupId: args.meetupId,
        userId: args.userId,
        status: "INVITED",
        joinedAt: Date.now(),
      });
      
      const meetup = await ctx.db.get(args.meetupId);
      if (meetup) {
        await ctx.db.insert("notifications", {
          userId: args.userId,
          title: "Meetup Invite",
          message: `You've been invited to join the meetup: ${meetup.title}`,
          link: `/meetups/${args.meetupId}`,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

export const getMessages = query({
  args: { meetupId: v.id("meetups") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("meetupMessages")
      .withIndex("by_meetup", (q) => q.eq("meetupId", args.meetupId))
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (msg) => {
        let user = await ctx.db.query("users").filter(q => q.eq(q.field("clerkId"), msg.userId)).first();
        if (!user) {
          user = await ctx.db.query("users").filter(q => q.eq(q.field("_id"), msg.userId)).first();
        }
        
        return {
          ...msg,
          id: msg._id,
          user: user ? { id: msg.userId, name: user.name || "Racer" } : { id: msg.userId, name: "Racer" },
        };
      })
    );
  },
});

export const sendMessage = mutation({
  args: {
    meetupId: v.id("meetups"),
    userId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user is host or JOINED
    const meetup = await ctx.db.get(args.meetupId);
    if (!meetup) throw new Error("Meetup not found");

    let isAuthorized = false;
    if (meetup.hostId === args.userId) {
      isAuthorized = true;
    } else {
      const participant = await ctx.db
        .query("meetupParticipants")
        .withIndex("by_meetup_user", (q) => q.eq("meetupId", args.meetupId).eq("userId", args.userId))
        .first();
      
      if (participant && participant.status === "JOINED") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new Error("You must join this meetup to chat");
    }

    await ctx.db.insert("meetupMessages", {
      meetupId: args.meetupId,
      userId: args.userId,
      text: args.text,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const createMeetupFromBooking = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const existing = await ctx.db
      .query("meetups")
      .withIndex("by_bookingId", (q) => q.eq("bookingId", booking._id))
      .first();

    if (existing) {
      return { success: false, message: "Meetup already exists for this booking." };
    }

    const users = await ctx.db.query("users").collect();
    const hostUser = users.find(u => u.clerkId === booking.userId || u._id === booking.userId);
    const userName = hostUser?.name || "A Driver";

    const meetupId = await ctx.db.insert("meetups", {
      title: `${userName}'s Track Session`,
      description: "Join me for an RC racing session! Open to all skill levels.",
      date: booking.date,
      time: booking.time || "10:00 - 12:00",
      venueId: booking.venueId,
      hostId: booking.userId,
      bookingId: booking._id,
      maxPlayers: 10,
      skillLevel: "All Levels",
      status: "OPEN",
      createdAt: Date.now(),
    });

    await ctx.db.insert("meetupParticipants", {
      meetupId,
      userId: booking.userId,
      status: "JOINED",
      joinedAt: Date.now(),
    });

    return { success: true, meetupId };
  }
});

export const deleteMeetupFromBooking = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const existing = await ctx.db
      .query("meetups")
      .withIndex("by_bookingId", (q) => q.eq("bookingId", booking._id))
      .first();

    if (!existing) {
      return { success: false, message: "Meetup not found." };
    }

    // Delete participants
    const participants = await ctx.db
      .query("meetupParticipants")
      .withIndex("by_meetup", (q) => q.eq("meetupId", existing._id))
      .collect();
    
    for (const p of participants) {
      await ctx.db.delete(p._id);
    }

    // Delete meetup
    await ctx.db.delete(existing._id);

    return { success: true };
  }
});
