import Image from "next/image";
import { cn } from "@/components/lib/utils";
import type { DbProfile } from "@/types/tasks";

type TaskAssigneeAvatarProps = {
  profile: Pick<DbProfile, "id" | "full_name" | "avatar_url">;
};

const getInitials = (name: string | null | undefined) => {
  if (!name) return "?";
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return `${first}${last}`.toUpperCase();
};

const TaskAssigneeAvatar = ({ profile }: TaskAssigneeAvatarProps) => {
  const initials = getInitials(profile.full_name);
  const title = profile.full_name || "Responsável";

  const avatarSrc = profile.avatar_url || "/images/avatar-placeholder.png";

  return (
    <div
      className={cn(
        "flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-[11px] font-semibold text-slate-200 ring-1 ring-slate-700/70"
      )}
      title={title}
    >
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt={title}
          width={24}
          height={24}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default TaskAssigneeAvatar;
