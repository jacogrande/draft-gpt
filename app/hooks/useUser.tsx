import { api } from "@convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { useMemo } from "react";
import { User } from "~/util/types";

export const useUser = () => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const profile = useQuery(
    api.identity.users.me,
    isAuthenticated ? {} : "skip"
  );
  const user: User | null = useMemo(
    () =>
      profile?.username
        ? { uid: profile.id, username: profile.username, email: profile.email }
        : null,
    [profile]
  );
  return {
    user,
    profile: profile ?? null,
    loading: isLoading || (isAuthenticated && profile === undefined),
  };
};
