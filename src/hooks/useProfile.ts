import useSWR from "swr";
import fetcher from "@/api/fetcher";
import type { UserProfile } from "@/types";

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<UserProfile>(
    "/user/profile/",
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    profile: data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
