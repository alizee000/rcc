"use client";

import { useState } from "react";
import styles from "../app/leaderboards/page.module.css";
import { useToast } from "./Toast";

export default function LeaderboardFilters() {
  const [filter, setFilter] = useState("All Time");
  const { showToast } = useToast();

  const handleFilter = (selected: string) => {
    setFilter(selected);
    showToast(`Showing ${selected} records`);
  };

  return (
    <div className={styles.filters}>
      <button 
        className={filter === "All Time" ? styles.filterBtnActive : styles.filterBtn}
        onClick={() => handleFilter("All Time")}
      >
        All Time
      </button>
      <button 
        className={filter === "This Month" ? styles.filterBtnActive : styles.filterBtn}
        onClick={() => handleFilter("This Month")}
      >
        This Month
      </button>
      <button 
        className={filter === "This Week" ? styles.filterBtnActive : styles.filterBtn}
        onClick={() => handleFilter("This Week")}
      >
        This Week
      </button>
    </div>
  );
}
