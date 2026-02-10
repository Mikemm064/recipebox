"use client";

export function CopyLinksButton({ links }: { links: string[] }) {
  return (
    <button
      className="bg-slate-200"
      onClick={async () => {
        await navigator.clipboard.writeText(links.join("\n"));
      }}
    >
      Copy links
    </button>
  );
}
