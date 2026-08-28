import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { fetchQuery } from "convex/nextjs";
// @ts-ignore
import { api } from "../../../convex/_generated/api";
import { authOptions } from "@/lib/auth";
import BookingsList from "@/components/BookingsList";

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch some venues to attach to the mock bookings
  const bookings = await fetchQuery(api.bookings.getBookings);

  return <BookingsList user={session.user} bookings={bookings} />;
}
