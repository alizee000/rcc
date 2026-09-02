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
    // In a real app we'd get the auth context, mock for now
    const userId = "mock_user_id";

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
        
        // Check if current user has liked this reel
        const like = await ctx.db
          .query("reelLikes")
          .withIndex("by_reel_user", (q) => q.eq("reelId", reel._id).eq("userId", userId))
          .first();
        
        return {
          ...reel,
          videoUrl: url,
          user,
          hasLiked: !!like,
        };
      })
    );
  },
});

export const toggleLike = mutation({
  args: { reelId: v.id("reels") },
  handler: async (ctx, args) => {
    const userId = "mock_user_id";
    const reel = await ctx.db.get(args.reelId);
    if (!reel) throw new Error("Reel not found");

    const existingLike = await ctx.db
      .query("reelLikes")
      .withIndex("by_reel_user", (q) => q.eq("reelId", args.reelId).eq("userId", userId))
      .first();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.reelId, { likes: Math.max(0, reel.likes - 1) });
      return false; // hasLiked is now false
    } else {
      // Like
      await ctx.db.insert("reelLikes", { reelId: args.reelId, userId });
      await ctx.db.patch(args.reelId, { likes: reel.likes + 1 });
      return true; // hasLiked is now true
    }
  },
});

export const getComments = query({
  args: { reelId: v.id("reels") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("reelComments")
      .withIndex("by_reel", (q) => q.eq("reelId", args.reelId))
      .order("desc")
      .collect();

    return comments.map(comment => ({
      ...comment,
      user: {
        name: comment.userId === "mock_user_id" ? "You" : "RC Enthusiast",
        imageUrl: "/images/rank_amateur.jpg"
      }
    }));
  },
});

export const addComment = mutation({
  args: { reelId: v.id("reels"), text: v.string() },
  handler: async (ctx, args) => {
    const userId = "mock_user_id";
    const reel = await ctx.db.get(args.reelId);
    if (!reel) throw new Error("Reel not found");

    const commentId = await ctx.db.insert("reelComments", {
      reelId: args.reelId,
      userId,
      text: args.text,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.reelId, { comments: reel.comments + 1 });
    
    return commentId;
  },
});

export const deleteAllReels = mutation({
  args: {},
  handler: async (ctx) => {
    const reels = await ctx.db.query("reels").collect();
    for (const reel of reels) {
      await ctx.db.delete(reel._id);
    }
    const likes = await ctx.db.query("reelLikes").collect();
    for (const like of likes) {
      await ctx.db.delete(like._id);
    }
    const comments = await ctx.db.query("reelComments").collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }
    return { deleted: reels.length };
  }
});
