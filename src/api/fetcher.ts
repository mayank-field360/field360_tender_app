import api from "./axios";

/**
 * SWR-compatible fetcher using our Axios instance.
 * Automatically attaches auth headers via interceptor.
 */
const fetcher = async <T = unknown>(url: string): Promise<T> => {
  const { data } = await api.get<T>(url);
  return data;
};

export default fetcher;
