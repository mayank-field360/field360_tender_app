import useSWR from "swr";
import fetcher from "@/api/fetcher";
import api from "@/api/axios";
import type { BidSubmitPayload, PaginatedResponse, Tender } from "@/types";

/** Fetch tenders assigned to the logged-in vendor */
export function useTenders(status?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const key = `/inventory/boq-bids/my-bids/?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<any>>(
    key,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 10000 }
  );

  const tenders: Tender[] = (data?.results ?? []).map((bid: any) => ({
    id: bid.id,
    boq_id: bid.boq?.id,
    title: bid.boq?.title || "Untitled",
    type: bid.boq?.boq_type || "MATERIAL",
    description: bid.boq?.terms_and_conditions || "",
    start_date: bid.boq?.start_date,
    end_date: bid.boq?.end_date,
    status: bid.status || "PENDING",
    project_name: bid.boq?.project?.name || "",
    items: bid.boq?.items || [],
    total_amount: bid.total_amount,
    boq_pdf_url: bid.boq?.pdf_url,
    document_sections: bid.boq?.document_sections || [],
    created_at: bid.boq?.created_at,
    updated_at: bid.boq?.modified_at,
  }));

  return {
    tenders,
    total: data?.count ?? 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/** Submit or update a bid */
export async function submitBid(bidId: string, payload: BidSubmitPayload) {
  const { data } = await api.post(`/inventory/boq-bids/${bidId}/submit/`, payload);
  return data;
}

/** Withdraw a bid */
export async function withdrawBid(bidId: string) {
  const { data } = await api.post(`/inventory/boq-bids/${bidId}/withdraw/`, {});
  return data;
}
