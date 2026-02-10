"use client";

import * as React from "react";

type ConfirmButtonProps = {
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

function handleClick() {
const ok = window.confirm(confirmMessage);
if (!ok) return;

startTransition(() => {
  void onConfirm();
});

}

return (
<button
type="button"
className={className}
onClick={handleClick}
disabled={disabled || isPending}
>
{children} </button>
);
}
