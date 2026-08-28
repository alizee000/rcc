import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    password: v.optional(v.string()),
    role: v.string(), // "USER", "VENUE_ADMIN", "ADMIN"
    createdAt: v.number(), // timestamp
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"]),

  venues: defineTable({
    name: v.string(),
    description: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    lat: v.number(),
    lng: v.number(),
    imageUrl: v.optional(v.string()),
    rating: v.number(),
    createdAt: v.number(),
  }),

  tracks: defineTable({
    venueId: v.id("venues"),
    name: v.string(),
    surface: v.string(),
    difficulty: v.string(),
    indoorOutdoor: v.string(),
    capacity: v.number(),
    createdAt: v.number(),
  }).index("by_venue", ["venueId"]),

  cars: defineTable({
    venueId: v.id("venues"),
    name: v.string(),
    type: v.string(),
    speed: v.string(),
    difficulty: v.string(),
    ageSuitable: v.number(),
    status: v.string(), // "AVAILABLE", "BOOKED", "MAINTENANCE"
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_venue", ["venueId"]),

  experiences: defineTable({
    venueId: v.id("venues"),
    name: v.string(),
    durationMins: v.number(),
    price: v.number(),
    maxPlayers: v.number(),
    minAge: v.number(),
    createdAt: v.number(),
  }).index("by_venue", ["venueId"]),

  availabilitySlots: defineTable({
    venueId: v.id("venues"),
    date: v.string(), // YYYY-MM-DD
    startTime: v.string(),
    endTime: v.string(),
    capacity: v.number(),
    bookedCount: v.number(),
    status: v.string(), // "AVAILABLE"
    createdAt: v.number(),
  }).index("by_venue_date", ["venueId", "date"]),

  bookings: defineTable({
    userId: v.string(),
    venueId: v.id("venues"),
    experienceId: v.id("experiences"),
    slotId: v.string(), // Allowing string to support mock slots in UI demo
    date: v.string(),
    status: v.string(), // "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"
    totalPrice: v.number(),
    qrCode: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_venue", ["venueId"]),

  bookingPlayers: defineTable({
    bookingId: v.id("bookings"),
    name: v.string(),
    age: v.number(),
  }).index("by_booking", ["bookingId"]),

  bookingCars: defineTable({
    bookingId: v.id("bookings"),
    carId: v.id("cars"),
  }).index("by_booking", ["bookingId"]),

  lapTimes: defineTable({
    userId: v.string(),
    trackId: v.id("tracks"),
    carId: v.optional(v.id("cars")),
    timeMs: v.number(),
    recordedAt: v.number(),
  })
    .index("by_track", ["trackId"])
    .index("by_user", ["userId"]),

  meetups: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.string(), // YYYY-MM-DD
    time: v.string(),
    venueId: v.id("venues"),
    hostId: v.string(),
    maxPlayers: v.number(),
    skillLevel: v.string(),
    status: v.string(), // "OPEN", "FULL", "COMPLETED", "CANCELLED"
    createdAt: v.number(),
  }).index("by_date", ["date"]),

  meetupParticipants: defineTable({
    meetupId: v.id("meetups"),
    userId: v.string(),
    status: v.string(), // "PENDING", "JOINED", "INVITED", "DECLINED"
    joinedAt: v.number(),
  })
    .index("by_meetup", ["meetupId"])
    .index("by_user", ["userId"])
    .index("by_meetup_user", ["meetupId", "userId"]),
});
