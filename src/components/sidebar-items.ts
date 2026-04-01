import type { SidebarItem } from "@/types/feature";

/**
 * サイドバーに表示する機能のリスト。
 *
 * 新しい機能を追加する場合は、ここにエントリを追加する。
 * 表示順序はこの配列の順序に従う。
 */
export const sidebarItems: SidebarItem[] = [
  {
    id: "template-replacer",
    label: "テンプレート変数置換",
    description: "行対応または直積でテンプレート変数を一括置換",
    icon: "🔄",
    href: "/features/template-replacer",
  },
];
