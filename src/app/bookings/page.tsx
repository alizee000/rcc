import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
// @ts-ignore
import { api } from "../../../convex/_generated/api";

import BookingsList from "@/components/BookingsList";

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  // Fetch some venues to attach to the mock bookings
  const bookings = await fetchQuery(api.bookings.getUserBookings, { userId: user.id as any });
  const invites = await fetchQuery(api.bookings.getUserBookingInvites, { userId: user.id as any });

  const serializedUser = {
    id: user.id,
    name: user.fullName || user.firstName || "Racer",
    email: user.emailAddresses[0]?.emailAddress || ""
  };

  return <BookingsList user={serializedUser as any} bookings={bookings} invites={invites} />;
}
