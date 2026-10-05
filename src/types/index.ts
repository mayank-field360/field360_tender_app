/* ── Auth ── */
export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

/* ── User ── */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  user_type: string;
  designation: string;
  profile_image: string | null;
  org_name: string;
  is_active: boolean;
  company_admin_role: string | null;
  admin_company_id: string | null;
}

/* ── BOQ / Tender ── */
export type TenderType = "MATERIAL" | "SERVICE";
export type BidStatus = "PENDING" | "SUBMITTED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export interface BOQItem {
  id: string;
  name: string;
  item_name?: string;
  title?: string;
  description: string;
  image_url?: string | null;
  unit: string;
  uom?: string;
  quantity: number;
  qty?: number;
  rate?: number;
  remarks?: string;
}

export interface Tender {
  id: string;
  boq_id: string;
  title: string;
  type: TenderType;
  description: string;
  start_date: string;
  end_date: string;
  status: BidStatus;
  project_name: string;
  items: BOQItem[];
  total_amount?: number;
  boq_pdf_url?: string;
  document_sections?: any[];
  created_at: string;
  updated_at: string;
}

export interface BidSubmitPayload {
  items: { boq_item_id: string; rate: number; remarks?: string }[];
  remarks?: string;
}

/* ── Notifications ── */
export interface Notification {
  id: string | number;
  title: string;
  body: string;
  image_url?: string;
  profile_image_url?: string;
  click_action?: string;
  project_id?: string;
  read: boolean;
  created_at: string;
  type?: string;
}

/* ── API ── */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
