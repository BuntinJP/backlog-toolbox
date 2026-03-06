"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarItems } from "./sidebar-items";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🧰</span>
        <span className={styles.logoText}>Backlog Toolbox</span>
      </div>

      <nav className={styles.nav}>
        <Link
          href="/"
          className={`${styles.navItem} ${pathname === "/" ? styles.active : ""}`}
        >
          <span className={styles.navIcon}>🏠</span>
          <span className={styles.navLabel}>ダッシュボード</span>
        </Link>

        {sidebarItems.length > 0 && (
          <div className={styles.divider} />
        )}

        {sidebarItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
            title={item.description}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <span className={styles.version}>v0.1.0</span>
      </div>
    </aside>
  );
}
