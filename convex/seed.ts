import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have data
    const existingVenues = await ctx.db.query("venues").collect();
    if (existingVenues.length > 0) {
      console.log("Database already seeded!");
      return "Already seeded";
    }

    // 1. Users
    const userId1 = await ctx.db.insert("users", {
      name: "John Doe",
      email: "john@rcrush.com",
      role: "USER",
      password: "password123", // Dummy password
      createdAt: Date.now(),
    });
    const userId2 = await ctx.db.insert("users", {
      name: "Jane Smith",
      email: "jane@rcrush.com",
      role: "USER",
      password: "password123",
      createdAt: Date.now(),
    });

    // 2. Venues
    const venue1 = await ctx.db.insert("venues", {
      name: "Electronic City RC Raceway",
      description: "Premier outdoor asphalt track with high-speed straights.",
      address: "123 Tech Park Drive",
      city: "Bangalore",
      state: "KA",
      lat: 12.8399,
      lng: 77.6770,
      imageUrl: "/images/venue_asphalt.jpg",
      rating: 4.8,
      createdAt: Date.now(),
    });

    const venue2 = await ctx.db.insert("venues", {
      name: "Koramangala Indoor Carpet",
      description: "Air-conditioned indoor carpet track. Very grippy!",
      address: "456 Inner Ring Road",
      city: "Bangalore",
      state: "KA",
      lat: 12.9352,
      lng: 77.6245,
      imageUrl: "/images/venue_carpet.jpg",
      rating: 4.6,
      createdAt: Date.now(),
    });

    // 3. Tracks
    const track1 = await ctx.db.insert("tracks", {
      venueId: venue1,
      name: "Main Circuit",
      surface: "Asphalt",
      difficulty: "Advanced",
      indoorOutdoor: "Outdoor",
      capacity: 10,
      createdAt: Date.now(),
    });

    const track2 = await ctx.db.insert("tracks", {
      venueId: venue2,
      name: "Technical Carpet Layout",
      surface: "Carpet",
      difficulty: "Intermediate",
      indoorOutdoor: "Indoor",
      capacity: 8,
      createdAt: Date.now(),
    });

    // 4. Cars
    const car1 = await ctx.db.insert("cars", {
      venueId: venue1,
      name: "XRAY X4 Buggy",
      type: "Buggy",
      speed: "Fast (70km/h)",
      difficulty: "Advanced",
      ageSuitable: 12,
      status: "AVAILABLE",
      imageUrl: "/images/car_drift.jpg",
      createdAt: Date.now(),
    });

    const car2 = await ctx.db.insert("cars", {
      venueId: venue2,
      name: "Traxxas Touring",
      type: "Touring",
      speed: "Medium (45km/h)",
      difficulty: "Beginner",
      ageSuitable: 8,
      status: "AVAILABLE",
      imageUrl: "/images/car_drift.jpg",
      createdAt: Date.now(),
    });

    // 5. Experiences
    const exp1 = await ctx.db.insert("experiences", {
      venueId: venue1,
      name: "30 Min Track Practice",
      durationMins: 30,
      price: 500,
      maxPlayers: 5,
      minAge: 10,
      createdAt: Date.now(),
    });

    // 6. Lap Times
    await ctx.db.insert("lapTimes", {
      userId: userId1,
      trackId: track1,
      carId: car1,
      timeMs: 14500, // 14.5s
      recordedAt: Date.now() - 100000,
    });
    
    await ctx.db.insert("lapTimes", {
      userId: userId2,
      trackId: track1,
      timeMs: 15200, // 15.2s
      recordedAt: Date.now() - 50000,
    });

    // 7. Meetups
    const d = new Date();
    d.setDate(d.getDate() + 2); // 2 days from now
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const meetup1 = await ctx.db.insert("meetups", {
      title: "Weekend Drift Battles",
      description: "Join us for some intense tandem drifting!",
      date: dateStr,
      time: "16:00 PM",
      venueId: venue1,
      hostId: userId1,
      maxPlayers: 8,
      skillLevel: "Intermediate",
      status: "OPEN",
      createdAt: Date.now(),
    });

    await ctx.db.insert("meetupParticipants", {
      meetupId: meetup1,
      userId: userId1,
      status: "JOINED",
      joinedAt: Date.now(),
    });

    await ctx.db.insert("meetupParticipants", {
      meetupId: meetup1,
      userId: userId2,
      status: "JOINED",
      joinedAt: Date.now(),
    });

    console.log("Database seeded successfully!");
    return "Seeded successfully";
  },
});
