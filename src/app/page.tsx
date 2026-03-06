import { Navbar } from "@/components/Navbar";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Navbar title="ダッシュボード" />
      <main className="main-content">
        <div className={styles.hero}>
          <h2 className={styles.greeting}>Hello, World 👋</h2>
          <p className={styles.description}>
            Backlog Toolbox へようこそ。
            <br />
            左のサイドバーから機能を選択してください。
          </p>
        </div>
      </main>
    </>
  );
}
