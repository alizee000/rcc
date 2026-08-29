import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Update existing venues to have categories
    const venues = await ctx.db.query("venues").collect();
    for (const v of venues) {
      if (!v.categories || v.categories.length === 0) {
        if (v.name.includes("Electronic City")) {
          await ctx.db.patch(v._id, { categories: ['RC Racing', 'Drift'] });
        } else if (v.name.includes("Koramangala")) {
          await ctx.db.patch(v._id, { categories: ['RC Racing'] });
        } else {
          await ctx.db.patch(v._id, { categories: ['RC Racing'] });
        }
      }
    }

    // 2. Add a new Off-Road Venue
    const existingOffRoad = venues.find(v => v.name === "Dirt Track Off-Road Park");
    if (!existingOffRoad) {
      const venue1 = await ctx.db.insert("venues", {
        name: "Dirt Track Off-Road Park",
        description: "Massive outdoor dirt track with huge jumps and whoops.",
        address: "789 Dirt Road",
        city: "Bangalore",
        state: "KA",
        lat: 13.011,
        lng: 77.555,
        imageUrl: "/images/venue_asphalt.jpg", // reuse image for now
        rating: 4.9,
        categories: ['Off-Road', 'Family'],
        createdAt: Date.now(),
      });

      // add a track
      await ctx.db.insert("tracks", {
        venueId: venue1,
        name: "Pro Dirt Layout",
        surface: "Dirt",
        difficulty: "Advanced",
        indoorOutdoor: "Outdoor",
        capacity: 12,
        createdAt: Date.now(),
      });

      // add a car
      await ctx.db.insert("cars", {
        venueId: venue1,
        name: "Traxxas Slash 4x4",
        type: "Short Course Truck",
        speed: "Fast (60km/h)",
        difficulty: "Intermediate",
        ageSuitable: 10,
        status: "AVAILABLE",
        imageUrl: "/images/car_drift.jpg",
        createdAt: Date.now(),
      });

      // add an experience
      await ctx.db.insert("experiences", {
        venueId: venue1,
        name: "60 Min Dirt Action",
        durationMins: 60,
        price: 800,
        maxPlayers: 4,
        minAge: 10,
        createdAt: Date.now(),
      });
    }

    // 3. Add a new Drift Specific Venue
    const existingDrift = venues.find(v => v.name === "Neon Drift Arena");
    if (!existingDrift) {
      const venue2 = await ctx.db.insert("venues", {
        name: "Neon Drift Arena",
        description: "Slick concrete drift arena with full neon lighting and music.",
        address: "101 Neon Street",
        city: "Bangalore",
        state: "KA",
        lat: 12.980,
        lng: 77.600,
        imageUrl: "/profile-bg.jpg", 
        rating: 4.7,
        categories: ['Drift', 'Birthday'],
        createdAt: Date.now(),
      });
      
      await ctx.db.insert("tracks", {
        venueId: venue2,
        name: "Neon Loop",
        surface: "Concrete",
        difficulty: "Intermediate",
        indoorOutdoor: "Indoor",
        capacity: 8,
        createdAt: Date.now(),
      });
      
      await ctx.db.insert("experiences", {
        venueId: venue2,
        name: "Drift Session",
        durationMins: 45,
        price: 600,
        maxPlayers: 6,
        minAge: 12,
        createdAt: Date.now(),
      });
    }

    return "Venues and categories seeded!";
  }
});
