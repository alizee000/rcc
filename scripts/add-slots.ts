const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const venues = await prisma.venue.findMany();
  
  for (const venue of venues) {
    const times = ['16:00', '17:00', '18:00', '19:00', '20:00'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      
      for (const time of times) {
        // Check if slot exists to avoid duplicates
        const existing = await prisma.availabilitySlot.findFirst({
          where: { venueId: venue.id, date: d, startTime: time }
        });
        
        if (!existing) {
          await prisma.availabilitySlot.create({
            data: {
              venueId: venue.id,
              date: d,
              startTime: time,
              endTime: String(parseInt(time.split(':')[0]) + 1) + ':00',
              capacity: 10,
              bookedCount: 0
            }
          });
        }
      }
    }
  }
  console.log("Added slots for the next 7 days!");
}

main().finally(() => prisma.$disconnect());
