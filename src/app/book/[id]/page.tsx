import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import BookingWizard from "@/components/BookingWizard";

export default async function BookExperience(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
    include: {
      experiences: true,
      tracks: true,
      cars: {
        where: { status: "AVAILABLE" }
      },
      slots: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' }
        ]
      }
    }
  });

  if (!venue) {
    notFound();
  }

  return <BookingWizard venue={venue} user={session.user} />;
}
