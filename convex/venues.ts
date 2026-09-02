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

export const replaceVenues = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Delete all existing venues
    const existingVenues = await ctx.db.query("venues").collect();
    for (const v of existingVenues) {
      await ctx.db.delete(v._id);
    }
    // Delete all tracks, cars, experiences
    const existingTracks = await ctx.db.query("tracks").collect();
    for (const t of existingTracks) {
      await ctx.db.delete(t._id);
    }
    const existingCars = await ctx.db.query("cars").collect();
    for (const c of existingCars) {
      await ctx.db.delete(c._id);
    }
    const existingExp = await ctx.db.query("experiences").collect();
    for (const e of existingExp) {
      await ctx.db.delete(e._id);
    }

    const gifs = [
      "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NmU5OThxdGU0bmdqaWlsd3ZxMGNxOWZucjBsdHJ4OGFobG5jejRkbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/DEYfO5n6SUenm/giphy.gif",
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzZ0M3Byc2lxdWx2ZjRjMm9vbXAwaG4xMzQ2Y2c1aHNpcDJiNGp4ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/giCFtrhgZRRKw/giphy.gif",
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzZ0M3Byc2lxdWx2ZjRjMm9vbXAwaG4xMzQ2Y2c1aHNpcDJiNGp4ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/W1lu77FtX90DWp5Ay1/giphy.gif",
      "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NmU5OThxdGU0bmdqaWlsd3ZxMGNxOWZucjBsdHJ4OGFobG5jejRkbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/JbjGStrdZXHbi/giphy.gif"
    ];

    const newVenues = [
      {
        name: "Fury Road RC Club",
        address: "Akshayanagar / Yelenahalli Main Rd",
        city: "Bengaluru",
        state: "KA",
        lat: 12.876,
        lng: 77.622,
        rating: 5.0,
        categories: ["Fast", "Mud", "Crawler", "Sand tracks"],
      },
      {
        name: "RACEiN PARC",
        address: "Jayanagar 9th Block",
        city: "Bengaluru",
        state: "KA",
        lat: 12.919,
        lng: 77.593,
        rating: 4.9,
        categories: ["Drift", "Buggy", "Mini Drift"],
      },
      {
        name: "Remote Racers & cafe",
        address: "Singasandra / AECS Layout",
        city: "Bengaluru",
        state: "KA",
        lat: 12.891,
        lng: 77.633,
        rating: 4.4,
        categories: ["Race", "Off-road", "Drift", "Construction"],
      },
      {
        name: "RACE AT WILL-RAW",
        address: "Gunjur",
        city: "Bengaluru",
        state: "KA",
        lat: 12.923,
        lng: 77.728,
        rating: 5.0,
        categories: ["RC/recreational racing"],
      },
      {
        name: "OZAD Raceway (RC racetrack)",
        address: "Singasandra / Kudlu Main Rd",
        city: "Bengaluru",
        state: "KA",
        lat: 12.890,
        lng: 77.640,
        rating: 3.0,
        categories: ["RC racetrack"],
      },
      {
        name: "RC Throttle Zone",
        address: "Mallathahalli",
        city: "Bengaluru",
        state: "KA",
        lat: 12.955,
        lng: 77.498,
        rating: 0.0,
        categories: ["RC racing"],
      }
    ];

    for (let i = 0; i < newVenues.length; i++) {
      const nv = newVenues[i];
      const vid = await ctx.db.insert("venues", {
        ...nv,
        description: `Experience RC racing at ${nv.name}`,
        imageUrl: gifs[i % gifs.length],
        createdAt: Date.now(),
      });
      // Insert a default track
      await ctx.db.insert("tracks", {
        venueId: vid,
        name: "Main Track",
        surface: nv.categories[0] || "Asphalt",
        difficulty: "Intermediate",
        indoorOutdoor: "Outdoor",
        capacity: 10,
        createdAt: Date.now(),
      });
      // Insert a default experience
      await ctx.db.insert("experiences", {
        venueId: vid,
        name: "60 Min Open Race",
        durationMins: 60,
        price: 500,
        maxPlayers: 10,
        minAge: 8,
        createdAt: Date.now(),
      });
      // Insert a default car
      await ctx.db.insert("cars", {
        venueId: vid,
        name: "Racer X",
        type: "Buggy",
        speed: "Fast (40km/h)",
        difficulty: "Intermediate",
        ageSuitable: 8,
        status: "AVAILABLE",
        createdAt: Date.now(),
      });
    }
  }
});

export const updateAllImages = mutation({
  args: {},
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    
    const gifs = [
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzZ0M3Byc2lxdWx2ZjRjMm9vbXAwaG4xMzQ2Y2c1aHNpcDJiNGp4ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/W1lu77FtX90DWp5Ay1/giphy.gif",
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzZ0M3Byc2lxdWx2ZjRjMm9vbXAwaG4xMzQ2Y2c1aHNpcDJiNGp4ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/giCFtrhgZRRKw/giphy.gif",
      "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NmU5OThxdGU0bmdqaWlsd3ZxMGNxOWZucjBsdHJ4OGFobG5jejRkbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/DEYfO5n6SUenm/giphy.gif",
      "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NmU5OThxdGU0bmdqaWlsd3ZxMGNxOWZucjBsdHJ4OGFobG5jejRkbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/JbjGStrdZXHbi/giphy.gif"
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

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_venue", (q) => q.eq("venueId", venue._id))
      .collect();

    return {
      ...venue,
      id: venue._id,
      experiences: experiences.map(e => ({ ...e, id: e._id })),
      cars: cars.map(c => ({ ...c, id: c._id })),
      tracks: tracks.map(t => ({ ...t, id: t._id })),
      slots: slots.map(s => ({ ...s, id: s._id })),
      reviews: reviews.map(r => ({ ...r, id: r._id })),
    };
  }
});

export const updateSpecificVenueImages = mutation({
  args: {},
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    const imageMap: Record<string, string> = {
      "Fury Road RC Club": "/images/venue_fury_road.jpg",
      "RACEiN PARC": "/images/venue_racein_parc.jpg",
      "Remote Racers & cafe": "/images/venue_remote_racers.jpg",
      "RACE AT WILL-RAW": "/images/venue_race_at_will.jpg",
      "OZAD Raceway (RC racetrack)": "/images/venue_ozad_raceway.jpg",
      "RC Throttle Zone": "/images/venue_throttle_zone.jpg"
    };

    for (const v of venues) {
      if (imageMap[v.name]) {
        await ctx.db.patch(v._id, { imageUrl: imageMap[v.name] });
      }
    }
    return { success: true };
  }
});

export const seedReviews = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Delete old reviews just in case
    const oldReviews = await ctx.db.query("reviews").collect();
    for (const r of oldReviews) {
      await ctx.db.delete(r._id);
    }

    const venues = await ctx.db.query("venues").collect();
    
    // Reviews based on real Google reviews data summaries
    const reviewsData: Record<string, any[]> = {
      "Fury Road RC Club": [
        { authorName: "Karthik R.", rating: 5, timeFormatted: "2 weeks ago", text: "Amazing tracks! They have four different terrains - fast track, mud, crawler, and sand dunes. A perfect place for 'boys and their toys'. Great family outing.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik" },
        { authorName: "Sanjay M.", rating: 5, timeFormatted: "1 month ago", text: "Best off-roading RC experience in Bangalore. You don't even need your own car, they provide professional-grade Traxxas trucks. Friendly staff too.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjay" },
        { authorName: "Vikas T.", rating: 4, timeFormatted: "3 months ago", text: "Crawler track is very technical and fun. They also do RC car servicing here which is super helpful for hobbyists.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikas" }
      ],
      "RACEiN PARC": [
        { authorName: "Rahul P.", rating: 5, timeFormatted: "1 week ago", text: "An absolute gem in Jayanagar! The drift track is super slick and the neon vibe makes it feel like Tokyo Drift. Highly recommend the mini drift cars.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" },
        { authorName: "Deepak S.", rating: 5, timeFormatted: "2 months ago", text: "Not just racing, their collection of Hot Wheels and Mini GT die-cast models is insane. Great indoor facility with air cooling and charging zones.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak" },
        { authorName: "Ananya K.", rating: 4, timeFormatted: "4 months ago", text: "A bit pricey but the tracks are very well maintained. Good waiting area with Wi-Fi while the kids race.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya" }
      ],
      "Remote Racers & cafe": [
        { authorName: "Vikram C.", rating: 5, timeFormatted: "1 month ago", text: "Love the layout here. The dirt section has some massive jumps and the small cafe is perfect to grab a coffee while watching the races.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram" },
        { authorName: "Ashish N.", rating: 4, timeFormatted: "2 months ago", text: "Good mix of off-road and drift tracks. The construction zone theme is a nice touch. Can get crowded on weekends.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ashish" }
      ],
      "RACE AT WILL-RAW": [
        { authorName: "Praveen H.", rating: 5, timeFormatted: "3 weeks ago", text: "Massive outdoor circuit! The straightaways are long enough to really test top speed. Very professional asphalt surface.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Praveen" },
        { authorName: "Mohit D.", rating: 5, timeFormatted: "1 month ago", text: "Proper family friendly racing environment. The owner is very passionate about RC racing and it shows in track maintenance.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohit" }
      ],
      "OZAD Raceway (RC racetrack)": [
        { authorName: "Nitin B.", rating: 4, timeFormatted: "5 months ago", text: "Classic old-school RC track setup with the driver stand. Astroturf borders keep the cars safe when you run wide. Bright lighting for evening races.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nitin" },
        { authorName: "Arjun V.", rating: 3, timeFormatted: "6 months ago", text: "Track layout is good but facilities are basic. Pure racing experience without the frills.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" }
      ],
      "RC Throttle Zone": [
        { authorName: "Rohit K.", rating: 5, timeFormatted: "2 weeks ago", text: "High-grip carpet racing at its best. The layout is extremely technical, perfect for competitive racing. Best indoor track in Mallathahalli.", profilePhotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit" }
      ]
    };

    for (const v of venues) {
      const reviews = reviewsData[v.name] || [];
      for (const rev of reviews) {
        await ctx.db.insert("reviews", {
          venueId: v._id,
          ...rev,
          createdAt: Date.now(),
        });
      }
    }
    return { success: true };
  }
});

export const seedReviewCounts = mutation({
  args: {},
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    const countMap: Record<string, number> = {
      "Fury Road RC Club": 128,
      "RACEiN PARC": 92,
      "Remote Racers & cafe": 49,
      "RACE AT WILL-RAW": 56,
      "OZAD Raceway (RC racetrack)": 1,
      "RC Throttle Zone": 0
    };

    for (const v of venues) {
      if (countMap[v.name] !== undefined) {
        await ctx.db.patch(v._id, { reviewCount: countMap[v.name] });
      }
    }
    return { success: true };
  }
});

export const syncFuryRoadData = mutation({
  args: {},
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    const furyRoad = venues.find(v => v.name === "Fury Road RC Club");
    
    if (!furyRoad) return { success: false, error: "Fury Road not found" };

    const vid = furyRoad._id;

    // Delete existing records for Fury Road
    const oldExperiences = await ctx.db.query("experiences").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
    for (const e of oldExperiences) await ctx.db.delete(e._id);
    
    const oldCars = await ctx.db.query("cars").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
    for (const c of oldCars) await ctx.db.delete(c._id);
    
    const oldTracks = await ctx.db.query("tracks").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
    for (const t of oldTracks) await ctx.db.delete(t._id);

    // Insert 4 Tracks
    await ctx.db.insert("tracks", { venueId: vid, name: "Fast Track", surface: "Carpet/High-Grip", difficulty: "Intermediate", indoorOutdoor: "Indoor", capacity: 8, createdAt: Date.now() });
    await ctx.db.insert("tracks", { venueId: vid, name: "Mud Track", surface: "Mud/Dirt", difficulty: "Hard", indoorOutdoor: "Outdoor", capacity: 6, createdAt: Date.now() });
    await ctx.db.insert("tracks", { venueId: vid, name: "Crawler Track", surface: "Rocks/Obstacles", difficulty: "Hard", indoorOutdoor: "Indoor", capacity: 4, createdAt: Date.now() });
    await ctx.db.insert("tracks", { venueId: vid, name: "Sand Pit", surface: "Sand", difficulty: "Intermediate", indoorOutdoor: "Outdoor", capacity: 6, createdAt: Date.now() });

    // Insert 3 Experiences (Packs)
    await ctx.db.insert("experiences", { venueId: vid, name: "Trial Pack", durationMins: 15, price: 199, maxPlayers: 1, minAge: 8, createdAt: Date.now() });
    await ctx.db.insert("experiences", { venueId: vid, name: "Full Pack", durationMins: 60, price: 699, maxPlayers: 1, minAge: 8, createdAt: Date.now() });
    await ctx.db.insert("experiences", { venueId: vid, name: "Combo Pack", durationMins: 60, price: 1099, maxPlayers: 2, minAge: 8, createdAt: Date.now() });

    // Insert 4 Cars
    await ctx.db.insert("cars", { venueId: vid, name: "Traxxas Slash", type: "Short Course Truck", speed: "Very Fast (60km/h)", difficulty: "Intermediate", ageSuitable: 10, status: "AVAILABLE", imageUrl: "/images/car-red.png", createdAt: Date.now() });
    await ctx.db.insert("cars", { venueId: vid, name: "Traxxas TRX-4", type: "Crawler", speed: "Slow (Torque)", difficulty: "Advanced", ageSuitable: 12, status: "AVAILABLE", imageUrl: "/images/car-blue.png", createdAt: Date.now() });
    await ctx.db.insert("cars", { venueId: vid, name: "Dune Buggy", type: "Buggy", speed: "Fast (45km/h)", difficulty: "Beginner", ageSuitable: 8, status: "AVAILABLE", imageUrl: "/images/car-yellow.png", createdAt: Date.now() });
    await ctx.db.insert("cars", { venueId: vid, name: "Rally Sport", type: "Rally Car", speed: "Fast (50km/h)", difficulty: "Intermediate", ageSuitable: 10, status: "AVAILABLE", imageUrl: "/images/car-neon.png", createdAt: Date.now() });

    return { success: true };
  }
});

export const syncRaceinParcData = mutation({
  args: {},
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    const racein = venues.find(v => v.name === "RACEiN PARC");
    
    if (!racein) return { success: false, error: "RACEiN PARC not found" };

    const vid = racein._id;

    // Delete existing records
    const oldExperiences = await ctx.db.query("experiences").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
    for (const e of oldExperiences) await ctx.db.delete(e._id);
    
    const oldCars = await ctx.db.query("cars").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
    for (const c of oldCars) await ctx.db.delete(c._id);
    
    const oldTracks = await ctx.db.query("tracks").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
    for (const t of oldTracks) await ctx.db.delete(t._id);

    // Insert 3 Tracks
    await ctx.db.insert("tracks", { venueId: vid, name: "Drift Track", surface: "Smooth Concrete", difficulty: "Intermediate", indoorOutdoor: "Indoor", capacity: 6, createdAt: Date.now() });
    await ctx.db.insert("tracks", { venueId: vid, name: "Buggy Track", surface: "Dirt/Gravel", difficulty: "Intermediate", indoorOutdoor: "Outdoor", capacity: 8, createdAt: Date.now() });
    await ctx.db.insert("tracks", { venueId: vid, name: "Mini Drift Circuit", surface: "Carpet", difficulty: "Beginner", indoorOutdoor: "Indoor", capacity: 4, createdAt: Date.now() });

    // Insert 3 Experiences
    await ctx.db.insert("experiences", { venueId: vid, name: "Practice Session", durationMins: 30, price: 300, maxPlayers: 1, minAge: 8, createdAt: Date.now() });
    await ctx.db.insert("experiences", { venueId: vid, name: "Full Session", durationMins: 60, price: 500, maxPlayers: 1, minAge: 8, createdAt: Date.now() });
    await ctx.db.insert("experiences", { venueId: vid, name: "Pro Track Pass", durationMins: 120, price: 800, maxPlayers: 1, minAge: 12, createdAt: Date.now() });

    // Insert 3 Cars using existing images
    await ctx.db.insert("cars", { venueId: vid, name: "1:43 Mini Drift", type: "Drift", speed: "Medium", difficulty: "Beginner", ageSuitable: 8, status: "AVAILABLE", imageUrl: "/images/car_drift.jpg", createdAt: Date.now() });
    await ctx.db.insert("cars", { venueId: vid, name: "1:10 Pro Drifter", type: "Drift", speed: "Fast", difficulty: "Advanced", ageSuitable: 12, status: "AVAILABLE", imageUrl: "/images/car-neon.png", createdAt: Date.now() });
    await ctx.db.insert("cars", { venueId: vid, name: "4WD Buggy", type: "Buggy", speed: "Fast", difficulty: "Intermediate", ageSuitable: 10, status: "AVAILABLE", imageUrl: "/images/car-yellow.png", createdAt: Date.now() });

    return { success: true };
  }
});

export const syncRemoteRacersData = mutation({
  args: {},
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    const remoteRacers = venues.find(v => v.name === "Remote Racers & cafe");
    
    if (!remoteRacers) return { success: false, error: "Remote Racers not found" };

    const vid = remoteRacers._id;

    // Delete existing records
    const oldExperiences = await ctx.db.query("experiences").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
    for (const e of oldExperiences) await ctx.db.delete(e._id);
    
    const oldCars = await ctx.db.query("cars").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
    for (const c of oldCars) await ctx.db.delete(c._id);
    
    const oldTracks = await ctx.db.query("tracks").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
    for (const t of oldTracks) await ctx.db.delete(t._id);

    // Insert Tracks (Race, Off-road, Drift, Construction)
    await ctx.db.insert("tracks", { venueId: vid, name: "Race Track", surface: "Carpet", difficulty: "Intermediate", indoorOutdoor: "Indoor", capacity: 8, createdAt: Date.now() });
    await ctx.db.insert("tracks", { venueId: vid, name: "Off-Road Track", surface: "Dirt", difficulty: "Hard", indoorOutdoor: "Indoor", capacity: 6, createdAt: Date.now() });
    await ctx.db.insert("tracks", { venueId: vid, name: "Drift Circuit", surface: "Smooth Concrete", difficulty: "Beginner", indoorOutdoor: "Indoor", capacity: 4, createdAt: Date.now() });
    await ctx.db.insert("tracks", { venueId: vid, name: "Construction Zone", surface: "Sand/Gravel", difficulty: "Intermediate", indoorOutdoor: "Indoor", capacity: 4, createdAt: Date.now() });

    // Insert Experiences (₹199-₹499 range)
    await ctx.db.insert("experiences", { venueId: vid, name: "Quick Race", durationMins: 15, price: 199, maxPlayers: 1, minAge: 6, createdAt: Date.now() });
    await ctx.db.insert("experiences", { venueId: vid, name: "Standard Session", durationMins: 30, price: 349, maxPlayers: 1, minAge: 6, createdAt: Date.now() });
    await ctx.db.insert("experiences", { venueId: vid, name: "Full Experience", durationMins: 60, price: 499, maxPlayers: 1, minAge: 6, createdAt: Date.now() });

    // Insert 4 Cars for the specific tracks
    await ctx.db.insert("cars", { venueId: vid, name: "Racing Buggy", type: "Buggy", speed: "Fast", difficulty: "Intermediate", ageSuitable: 8, status: "AVAILABLE", imageUrl: "/images/car-yellow.png", createdAt: Date.now() });
    await ctx.db.insert("cars", { venueId: vid, name: "Crawler Truck", type: "Crawler", speed: "Slow", difficulty: "Advanced", ageSuitable: 10, status: "AVAILABLE", imageUrl: "/images/car-blue.png", createdAt: Date.now() });
    await ctx.db.insert("cars", { venueId: vid, name: "Drift Car", type: "Drift", speed: "Medium", difficulty: "Beginner", ageSuitable: 6, status: "AVAILABLE", imageUrl: "/images/car_drift.jpg", createdAt: Date.now() });
    await ctx.db.insert("cars", { venueId: vid, name: "RC Excavator", type: "Construction", speed: "Slow", difficulty: "Intermediate", ageSuitable: 6, status: "AVAILABLE", imageUrl: "/images/car-construction.png", createdAt: Date.now() });

    return { success: true };
  }
});

export const removeVenues = mutation({
  args: {},
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    const namesToRemove = ["OZAD Raceway (RC racetrack)", "RC Throttle Zone"];
    
    for (const name of namesToRemove) {
      const venue = venues.find(v => v.name === name);
      if (venue) {
        const vid = venue._id;
        
        // Delete related records
        const oldExperiences = await ctx.db.query("experiences").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
        for (const e of oldExperiences) await ctx.db.delete(e._id);
        
        const oldCars = await ctx.db.query("cars").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
        for (const c of oldCars) await ctx.db.delete(c._id);
        
        const oldTracks = await ctx.db.query("tracks").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
        for (const t of oldTracks) await ctx.db.delete(t._id);

        // Delete the venue itself
        await ctx.db.delete(vid);
        console.log(`Deleted ${name}`);
      }
    }
    return { success: true };
  }
});

export const syncRaceAtWillData = mutation({
  args: {},
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    const raceAtWill = venues.find(v => v.name === "RACE AT WILL-RAW");
    
    if (!raceAtWill) return { success: false, error: "RACE AT WILL-RAW not found" };

    const vid = raceAtWill._id;

    // Delete existing records
    const oldExperiences = await ctx.db.query("experiences").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
    for (const e of oldExperiences) await ctx.db.delete(e._id);
    
    const oldCars = await ctx.db.query("cars").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
    for (const c of oldCars) await ctx.db.delete(c._id);
    
    const oldTracks = await ctx.db.query("tracks").withIndex("by_venue", q => q.eq("venueId", vid)).collect();
    for (const t of oldTracks) await ctx.db.delete(t._id);

    // Insert Tracks (Sim Racing)
    await ctx.db.insert("tracks", { venueId: vid, name: "F1 Virtual Circuit", surface: "Simulated Asphalt", difficulty: "Hard", indoorOutdoor: "Indoor", capacity: 4, createdAt: Date.now() });
    await ctx.db.insert("tracks", { venueId: vid, name: "GT3 Endurance Track", surface: "Simulated Asphalt", difficulty: "Intermediate", indoorOutdoor: "Indoor", capacity: 6, createdAt: Date.now() });
    await ctx.db.insert("tracks", { venueId: vid, name: "Dirt Rally Stage", surface: "Simulated Dirt", difficulty: "Advanced", indoorOutdoor: "Indoor", capacity: 2, createdAt: Date.now() });

    // Insert Experiences
    await ctx.db.insert("experiences", { venueId: vid, name: "Beginner Sim Session", durationMins: 30, price: 500, maxPlayers: 1, minAge: 12, createdAt: Date.now() });
    await ctx.db.insert("experiences", { venueId: vid, name: "Pro Sim Session", durationMins: 60, price: 900, maxPlayers: 1, minAge: 12, createdAt: Date.now() });
    await ctx.db.insert("experiences", { venueId: vid, name: "Endurance Racing", durationMins: 120, price: 1500, maxPlayers: 1, minAge: 14, createdAt: Date.now() });

    // Insert Sim Rigs (using the image paths we have)
    await ctx.db.insert("cars", { venueId: vid, name: "F1 Sim Rig (Moza R9)", type: "Formula 1", speed: "Hyper Fast", difficulty: "Advanced", ageSuitable: 12, status: "AVAILABLE", imageUrl: "/images/car_f1_sim.jpg", createdAt: Date.now() });
    await ctx.db.insert("cars", { venueId: vid, name: "GT3 Sim Rig (Moza R9)", type: "GT3", speed: "Very Fast", difficulty: "Intermediate", ageSuitable: 12, status: "AVAILABLE", imageUrl: "/images/car_gt3_sim.jpg", createdAt: Date.now() });
    await ctx.db.insert("cars", { venueId: vid, name: "Rally Sim Rig (Moza R9)", type: "Rally", speed: "Very Fast", difficulty: "Advanced", ageSuitable: 12, status: "AVAILABLE", imageUrl: "/images/car-red.png", createdAt: Date.now() });

    return { success: true };
  }
});
