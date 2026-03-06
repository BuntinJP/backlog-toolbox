/**
 * features ディレクトリのレイアウト
 * 各機能の page.tsx はこのレイアウト内にレンダリングされる
 */
export default function FeaturesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
