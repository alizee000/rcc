import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getVenues = query({
  args: {},
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    
    // Fetch relations for each venue
    const venuesWithRelations = await Promise.all(
      venues.map(async (venue) => {
        const experiences = await ctx.db
          .query("experiences")
          .withIndex("by_venue", (q) => q.eq("venueId", venue._id))
          .collect();
          
        const cars = await ctx.db
          .query("cars")
          .withIndex("by_venue", (q) => q.eq("venueId", venue._id))
          .collect();
          
        const tracks = await ctx.db
          .query("tracks")
          .withIndex("by_venue", (q) => q.eq("venueId", venue._id))
          .collect();

        return {
          ...venue,
          id: venue._id,
          experiences: experiences.map(e => ({ ...e, id: e._id })),
          cars: cars.map(c => ({ ...c, id: c._id })),
          tracks: tracks.map(t => ({ ...t, id: t._id })),
        };
      })
    );
    
    return venuesWithRelations;
  },
});

export const updateAllImages = mutation({
  args: {},
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    
    const gifs = [
      "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NmU5OThxdGU0bmdqaWlsd3ZxMGNxOWZucjBsdHJ4OGFobG5jejRkbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/JbjGStrdZXHbi/giphy.gif",
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzZ0M3Byc2lxdWx2ZjRjMm9vbXAwaG4xMzQ2Y2c1aHNpcDJiNGp4ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/giCFtrhgZRRKw/giphy.gif",
      "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NmU5OThxdGU0bmdqaWlsd3ZxMGNxOWZucjBsdHJ4OGFobG5jejRkbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/DEYfO5n6SUenm/giphy.gif",
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzZ0M3Byc2lxdWx2ZjRjMm9vbXAwaG4xMzQ2Y2c1aHNpcDJiNGp4ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/W1lu77FtX90DWp5Ay1/giphy.gif"
    ];

    for (let i = 0; i < venues.length; i++) {
      const venue = venues[i];
      await ctx.db.patch(venue._id, {
        imageUrl: gifs[i % gifs.length]
      });
    }
  },
});

export const getVenueById = query({
  args: { id: v.id("venues") },
  handler: async (ctx, args) => {
    const venue = await ctx.db.get(args.id);
    if (!venue) return null;

    const experiences = await ctx.db
      .query("experiences")
      .withIndex("by_venue", (q) => q.eq("venueId", venue._id))
      .collect();
      
    const cars = await ctx.db
      .query("cars")
      .withIndex("by_venue", (q) => q.eq("venueId", venue._id))
      .collect();
      
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_venue", (q) => q.eq("venueId", venue._id))
      .collect();

    const slots = await ctx.db
      .query("availabilitySlots")
      .withIndex("by_venue_date", (q) => q.eq("venueId", venue._id))
      .collect();

    return {
      ...venue,
      id: venue._id,
      experiences: experiences.map(e => ({ ...e, id: e._id })),
      cars: cars.map(c => ({ ...c, id: c._id })),
      tracks: tracks.map(t => ({ ...t, id: t._id })),
      slots: slots.map(s => ({ ...s, id: s._id })),
    };
  }
});
