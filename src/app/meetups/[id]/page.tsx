import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Calendar, Clock, MapPin, Trophy, Users, CheckCircle2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import styles from "./page.module.css";
import JoinMeetupButton from "@/components/JoinMeetupButton";

export default async function MeetupDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  const meetup = await prisma.meetup.findUnique({
    where: { id: params.id },
    include: {
      host: { select: { id: true, name: true, email: true } },
      venue: { select: { id: true, name: true, address: true, imageUrl: true } },
      participants: { 
        include: { user: { select: { id: true, name: true } } }
      }
    }
  });

  if (!meetup) {
    notFound();
  }

  const currentUser = session?.user;
  const currentParticipant = meetup.participants.find(p => p.user.email === currentUser?.email);
  const userStatus = currentParticipant ? currentParticipant.status : null;
  const joinedParticipants = meetup.participants.filter(p => p.status === "JOINED");
  const invitedParticipants = meetup.participants.filter(p => p.status === "INVITED");
  const isFull = joinedParticipants.length >= meetup.maxPlayers;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/meetups" className={styles.backBtn}>
          <ArrowLeft size={20} />
        </Link>
        <img src={meetup.venue.imageUrl || ""} alt={meetup.venue.name} className={styles.heroImg} />
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>{meetup.title}</h1>
        
        <div className={styles.hostSection}>
          <div className={styles.avatarLarge}>
            {meetup.host.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Hosted by</div>
            <div style={{ fontWeight: 600 }}>{meetup.host.name}</div>
          </div>
        </div>

        <div className={styles.detailsCard}>
          <div className={styles.detailRow}>
            <MapPin size={20} color="var(--accent-primary)" />
            <div>
              <div style={{ fontWeight: 600 }}>{meetup.venue.name}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{meetup.venue.address}</div>
            </div>
          </div>
          <div className={styles.detailRow}>
            <Calendar size={20} color="var(--accent-primary)" />
            <div>
              <div style={{ fontWeight: 600 }}>{new Date(meetup.date).toLocaleDateString()}</div>
            </div>
          </div>
          <div className={styles.detailRow}>
            <Clock size={20} color="var(--accent-primary)" />
            <div>
              <div style={{ fontWeight: 600 }}>{meetup.time}</div>
            </div>
          </div>
          <div className={styles.detailRow}>
            <Trophy size={20} color="var(--accent-primary)" />
            <div>
              <div style={{ fontWeight: 600 }}>{meetup.skillLevel}</div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          <p className={styles.description}>{meetup.description}</p>
        </div>

        <div className={styles.section}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Players ({joinedParticipants.length}/{meetup.maxPlayers})</h2>
          </div>
          
          <div className={styles.playersList}>
            {joinedParticipants.map(p => (
              <div key={p.id} className={styles.playerItem}>
                <div className={styles.playerAvatar}>{p.user.name.substring(0, 2).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.user.name}</div>
                  {p.user.id === meetup.host.id && <div style={{ fontSize: 12, color: "var(--accent-primary)" }}>Host</div>}
                </div>
                {p.user.email === currentUser?.email && (
                  <div style={{ marginLeft: "auto", color: "var(--success)" }}><CheckCircle2 size={20} /></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {invitedParticipants.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Invited</h2>
            <div className={styles.playersList}>
              {invitedParticipants.map(p => (
                <div key={p.id} className={styles.playerItem} style={{ opacity: 0.7 }}>
                  <div className={styles.playerAvatar} style={{ backgroundColor: "var(--bg-secondary)" }}>
                    {p.user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.user.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        {currentUser?.email !== meetup.host.email && (
          <JoinMeetupButton meetupId={meetup.id} initialStatus={userStatus} isFull={isFull} />
        )}
      </div>
    </div>
  );
}
