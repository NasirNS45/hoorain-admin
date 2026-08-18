import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminAccount, AdminAccountWrite, AuditLog } from "@/types/api";

type ListParams = {
  q?: string;
  page?: number;
  limit?: number;
};

type AuditParams = {
  action?: string;
  entity_type?: string;
  admin_user_id?: string;
  page?: number;
  limit?: number;
};

function searchParams(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    query.set(key, String(value));
  }
  const encoded = query.toString();
  return encoded ? `?${encoded}` : "";
}

export function useAdminUsers(params: ListParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => api.getPage<AdminAccount>(`/api/v1/users${searchParams(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => api.get<AdminAccount>(`/api/v1/users/${id}`),
    enabled: Boolean(id),
  });
}

export function useSaveAdminUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string; body: AdminAccountWrite }) =>
      input.id
        ? api.patch<AdminAccount>(`/api/v1/users/${input.id}`, input.body)
        : api.post<AdminAccount>("/api/v1/users", input.body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["users"] });
      void client.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

export function useAuditLogs(params: AuditParams) {
  return useQuery({
    queryKey: ["audit", params],
    queryFn: () => api.getPage<AuditLog>(`/api/v1/audit-logs${searchParams(params)}`),
    placeholderData: keepPreviousData,
  });
}
