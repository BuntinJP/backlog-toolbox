import type { ReactNode } from "react";
import styles from "./Navbar.module.css";

type NavbarProps = {
  /** 現在の機能名 */
  title: string;
  /** 右側に配置するアクションボタン等 */
  children?: ReactNode;
};

export function Navbar({ title, children }: NavbarProps) {
  return (
    <header className={styles.navbar}>
      <h1 className={styles.title}>{title}</h1>
      {children && <div className={styles.actions}>{children}</div>}
    </header>
  );
}
