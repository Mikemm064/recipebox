"use client";

import * as React from "react";

export type ConfirmButtonProps = {
  /** Back-compat: some call sites use `message` */
  message?: string;
  /** Preferred prop name */
  confirmMessage?: string;

  onConfirm?: () => void | Promise<void>; // optional, since this is often used inside a <form>
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function ConfirmButton({
  message,
  confirmMessage,
  onConfirm,
  children,
  className,
  disabled,
}: ConfirmButtonProps) {
  const [isPending, startTransition] = React.useTransition();

  const finalMessage = confirmMessage ?? message ?? "Are you sure?";

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const ok = window.confirm(finalMessage);
      if (!ok) {
        // If this button is inside a form, prevent submit
        e.preventDefault();
        return;
      }

      // If caller provided onConfirm, run it.
      if (onConfirm) {
        e.preventDefault();
        startTransition(() => {
          void onConfirm();
        });
      }
      // Otherwise, allow the form submit to proceed normally.
    },
    [finalMessage, onConfirm, startTransition]
  );

  return (
    <button
      type="submit"
      className={className}
      onClick={handleClick}
      disabled={Boolean(disabled) || isPending}
    >
      {children}
    </button>
  );
}
