import type { Database } from "@/types/database";

export type DbTask = Database["public"]["Tables"]["tasks"]["Row"];
export type DbProfile = Database["public"]["Tables"]["profiles"]["Row"];

export type TaskWithAssignees = DbTask & {
  assignees?: Pick<DbProfile, "id" | "full_name" | "avatar_url">[];
};
