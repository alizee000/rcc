import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createReel = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // In a real app we'd get the auth context, mock for now
    const userId = "mock_user_id";

    const reelId = await ctx.db.insert("reels", {
      userId,
      title: args.title,
      description: args.description,
      storageId: args.storageId,
      likes: 0,
      comments: 0,
      createdAt: Date.now(),
    });

    return reelId;
  },
});

export const getReels = query({
  args: {},
  handler: async (ctx) => {
    const reels = await ctx.db
      .query("reels")
      .order("desc") // Get newest first
      .take(50);
      
    // Fetch user details and video URL for each reel
    return await Promise.all(
      reels.map(async (reel) => {
        const url = await ctx.storage.getUrl(reel.storageId);
        
        // Mock user data for the demo
        const user = {
          name: "RC Enthusiast",
          imageUrl: "/images/rank_amateur.jpg"
        };
        
        return {
          ...reel,
          videoUrl: url,
          user
        };
      })
    );
  },
});
