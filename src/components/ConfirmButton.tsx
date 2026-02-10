"use client";

import * as React from "react";

export type ConfirmButtonProps = {
  confirmMessage?: string;
  onConfirm: () => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function ConfirmButton({
  confirmMessage = "Are you sure?",
  onConfirm,
  children,
  className,
  disabled,
}: ConfirmButtonProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleClick = React.useCallback(() => {
    const ok = window.confirm(confirmMessage);
    if (!ok) return;

    startTransition(() => {
      void onConfirm();
    });
  }, [confirmMessage, onConfirm, startTransition]);

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={Boolean(disabled) || isPending}
    >
      {children}
    </button>
  );
}
