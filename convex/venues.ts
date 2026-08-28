import { query } from "./_generated/server";

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
