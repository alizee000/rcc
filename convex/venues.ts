import { query } from "./_generated/server";

export const getVenues = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("venues").collect();
  },
});
