"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  /** モーダルの表示状態 */
  open: boolean;
  /** 閉じるコールバック */
  onClose: () => void;
  /** モーダルのタイトル */
  title: string;
  /** モーダルのコンテンツ */
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="border-none rounded-xl p-0 bg-card-bg text-foreground shadow-2xl max-w-[520px] w-[90vw] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      onClose={onClose}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            className="flex items-center justify-center w-7 h-7 border-none rounded-md bg-transparent text-muted text-sm cursor-pointer transition-all duration-150 hover:bg-hover-bg hover:text-foreground"
            onClick={onClose}
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
        <div className="px-6 pt-5 pb-6">{children}</div>
      </div>
    </dialog>
  );
}
