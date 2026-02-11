"use client";

type DbDisabledButtonProps = {
  label: string;
  className?: string;
};

export function DbDisabledButton({ label, className }: DbDisabledButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.alert("DB not connected yet")}
    >
      {label}
    </button>
  );
}
