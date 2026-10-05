import useSWR from "swr";
import fetcher from "@/api/fetcher";
import type { PaginatedResponse, Notification } from "@/types";

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Notification>>(
    "/user/notification/",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const boqNotifications = data?.results?.filter(
    (n) => {
      const titleLower = n.title?.toLowerCase() || "";
      const actionLower = n.click_action?.toLowerCase() || "";
      return (
        actionLower.includes("boq") ||
        titleLower.includes("boq") ||
        titleLower.includes("bid") ||
        actionLower.includes("bid") ||
        actionLower.includes("tender") ||
        titleLower.includes("tender")
      );
    }
  ) ?? [];

  const unreadCount = boqNotifications.filter((n) => !n.read).length;

  return {
    notifications: boqNotifications,
    unreadCount,
    isLoading,
    isError: !!error,
    mutate,
  };
}
