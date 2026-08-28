import { query } from "./_generated/server";
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
