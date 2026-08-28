// This is a temporary mock to prevent build failures on pages not yet fully migrated to Convex
const dummyPromise = Promise.resolve([]);
const dummyObj = {
  findMany: () => dummyPromise,
  findUnique: () => Promise.resolve(null),
  create: () => Promise.resolve({}),
  update: () => Promise.resolve({}),
  delete: () => Promise.resolve({}),
  count: () => Promise.resolve(0),
};

const prisma = {
  user: dummyObj,
  venue: dummyObj,
  track: dummyObj,
  car: dummyObj,
  booking: dummyObj,
  lapTime: dummyObj,
  meetup: dummyObj,
  availabilitySlot: dummyObj,
  experience: dummyObj,
};

export default prisma;
