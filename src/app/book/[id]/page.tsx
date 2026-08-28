import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
// @ts-ignore
import { api } from "../../../../convex/_generated/api";
// @ts-ignore
import { Id } from "../../../../convex/_generated/dataModel";

import BookingWizard from "@/components/BookingWizard";

export const dynamic = 'force-dynamic';

export default async function BookExperience(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  let venue;
  try {
    venue = await fetchQuery(api.venues.getVenueById, { id: params.id as Id<"venues"> });
  } catch (e) {
    return notFound();
  }

  if (!venue) {
    notFound();
  }

  // Filter cars and slots here instead of in the DB query
  const availableCars = venue.cars?.filter((c: any) => c.status === "AVAILABLE") || [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let validSlots = venue.slots?.filter((s: any) => {
    const slotDate = new Date(s.date);
    return slotDate >= today;
  }).sort((a: any, b: any) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  }) || [];

  // Fallback: If no slots exist in the database, generate some mock slots for the next 7 days
  if (validSlots.length === 0) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const times = [
        { start: "10:00", end: "11:00" },
        { start: "12:00", end: "13:00" },
        { start: "15:00", end: "16:00" },
        { start: "18:00", end: "19:00" },
        { start: "20:00", end: "21:00" }
      ];
      
      times.forEach((t, index) => {
        validSlots.push({
          id: `mock-slot-${i}-${index}`,
          venueId: venue.id,
          date: dateStr, // e.g. 2026-08-28
          startTime: t.start,
          endTime: t.end,
          capacity: 10,
          bookedCount: Math.floor(Math.random() * 5), // randomly booked
          status: "AVAILABLE",
          createdAt: Date.now()
        });
      });
    }
  }

  const processedVenue = {
    ...venue,
    cars: availableCars,
    slots: validSlots
  };

  return <BookingWizard venue={processedVenue} user={{ id: user.id, name: user.fullName || user.firstName || "User", email: user.emailAddresses[0]?.emailAddress }} />;
}
