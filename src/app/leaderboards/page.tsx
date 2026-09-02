import Link from 'next/link';
import { Trophy, Clock, Medal, MapPin } from 'lucide-react';
import { fetchQuery } from "convex/nextjs";
// @ts-ignore
import { api } from "../../../convex/_generated/api";
import styles from './page.module.css';
import LeaderboardFilters from '@/components/LeaderboardFilters';

export const dynamic = 'force-dynamic';

function formatTime(ms: number) {
  const date = new Date(ms);
  const m = date.getUTCMinutes();
  const s = date.getUTCSeconds();
  const msPart = ms % 1000;
  return `${m}:${s.toString().padStart(2, '0')}.${msPart.toString().padStart(3, '0')}`;
}

export default async function LeaderboardsPage() {
  const lapTimes = await fetchQuery(api.lapTimes.getLeaderboards);

  return (
    <div className={styles.container}>
      <LeaderboardFilters />

      <div className={styles.leaderboardList}>
        {lapTimes.map((lap, index) => {
          const isTop3 = index < 3;
          let rankIcon = <span style={{ padding: "0 6px" }}>{index + 1}</span>;
          if (index === 0) rankIcon = <span>👽</span>; // Alien tier
          else if (index === 1) rankIcon = <span>🚀</span>; // Rocket tier
          else if (index === 2) rankIcon = <span>🔥</span>; // Fire tier

          return (
            <Link href={`/driver/${lap.user.id}`} key={lap.id} className={`${styles.row} ${isTop3 ? styles.rowTop3 : ''}`}>
              <div className={styles.rank} style={{ fontSize: isTop3 ? 24 : 16 }}>
                {rankIcon}
              </div>
              
              <div className={styles.driverInfo}>
                <div className={styles.driverName}>{lap.user.name}</div>
                <div className={styles.carInfo}>{lap.car?.name || 'Custom Car'}</div>
              </div>
              
              <div className={styles.timeInfo}>
                <div className={styles.timeValue}>{formatTime(lap.timeMs)}</div>
                <div className={styles.timeDiff}>
                  {index > 0 ? `+${formatTime(lap.timeMs - lapTimes[0].timeMs)}` : 'Record'}
                </div>
              </div>
            </Link>
          );
        })}

        {lapTimes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            No lap times recorded yet for this track. Be the first!
          </div>
        )}
      </div>
    </div>
  );
}
