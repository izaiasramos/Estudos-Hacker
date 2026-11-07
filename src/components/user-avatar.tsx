import { avatarUrl } from "@/lib/avatar";

export function UserAvatar({
  userId,
  name,
  hasAvatar,
  className = "size-9",
}: {
  userId: string;
  name: string;
  hasAvatar: boolean;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full border border-accent/50 bg-accent/10 font-semibold text-accent ${className}`}
    >
      {hasAvatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl(userId)} alt="" className="size-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}
