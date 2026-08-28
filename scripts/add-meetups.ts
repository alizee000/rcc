const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const venues = await prisma.venue.findMany();
  
  if (users.length > 0 && venues.length > 0) {
    const host = users[0];
    const venue = venues[0];
    
    // Create an open meetup
    const m1 = await prisma.meetup.create({
      data: {
        title: 'Saturday Evening Drift Session',
        description: 'Casual drift session for beginners and intermediate racers. Bring your own cars or rent at the venue.',
        date: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
        time: '18:00',
        venueId: venue.id,
        hostId: host.id,
        maxPlayers: 5,
        skillLevel: 'Beginner/Intermediate',
        status: 'OPEN',
        participants: {
          create: [
            { userId: host.id, status: 'JOINED' }
          ]
        }
      }
    });

    // Create a full meetup
    const m2 = await prisma.meetup.create({
      data: {
        title: 'Pro Buggy Race',
        description: 'High-speed off-road racing. Advanced players only!',
        date: new Date(new Date().setDate(new Date().getDate() + 1)),
        time: '14:00',
        venueId: venues[1]?.id || venue.id,
        hostId: users[1]?.id || host.id,
        maxPlayers: 8,
        skillLevel: 'Pro',
        status: 'OPEN',
        participants: {
          create: [
            { userId: users[1]?.id || host.id, status: 'JOINED' }
          ]
        }
      }
    });

    console.log("Mock meetups created!");
  }
}

main().finally(() => prisma.$disconnect());
