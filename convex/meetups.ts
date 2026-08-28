import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMeetups = query({
  args: {},
  handler: async (ctx) => {
    const meetups = await ctx.db.query("meetups").order("asc").collect();
    
    // Fetch related data for each meetup
    const meetupsWithRelations = await Promise.all(
      meetups.map(async (meetup) => {
        const host = await ctx.db.get(meetup.hostId);
        const venue = await ctx.db.get(meetup.venueId);
        const participants = await ctx.db
          .query("meetupParticipants")
          .withIndex("by_meetup", (q) => q.eq("meetupId", meetup._id))
          .collect();

        return {
          ...meetup,
          id: meetup._id,
          host: host ? { id: host._id, name: host.name } : null,
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

    const host = await ctx.db.get(meetup.hostId);
    const venue = await ctx.db.get(meetup.venueId);
    
    const participantDocs = await ctx.db
      .query("meetupParticipants")
      .withIndex("by_meetup", (q) => q.eq("meetupId", meetup._id))
      .collect();

    const participants = await Promise.all(
      participantDocs.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          ...p,
          id: p._id,
          user: user ? { id: user._id, name: user.name } : null,
        };
      })
    );

    return {
      ...meetup,
      id: meetup._id,
      host: host ? { id: host._id, name: host.name } : null,
      venue: venue ? { id: venue._id, name: venue.name, city: venue.city, imageUrl: venue.imageUrl } : null,
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
    hostId: v.id("users"), // We will pass this from the client session
    invitedUserIds: v.array(v.id("users")),
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
    userId: v.id("users"),
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
        status: "JOINED",
        joinedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
