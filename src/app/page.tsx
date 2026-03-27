import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar title="ダッシュボード" />
      <main className="flex-1 p-6">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--navbar-height)-48px)] text-center">
          <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
            Hello, World 👋
          </h2>
          <p className="text-base text-muted leading-relaxed">
            Backlog Toolbox へようこそ。
            <br />
            左のサイドバーから機能を選択してください。
          </p>
        </div>
      </main>
    </>
  );
}
