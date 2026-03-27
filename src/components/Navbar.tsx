import type { ReactNode } from "react";

type NavbarProps = {
  /** 現在の機能名 */
  title: string;
  /** 右側に配置するアクションボタン等 */
  children?: ReactNode;
};

export function Navbar({ title, children }: NavbarProps) {
  return (
    <header className="flex items-center justify-between h-[var(--navbar-height)] px-6 bg-navbar-bg border-b border-border backdrop-blur-[12px] sticky top-0 z-50">
      <h1 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
