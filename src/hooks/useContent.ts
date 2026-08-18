import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Hero,
  HeroWrite,
  HomepageSection,
  SettingGroup,
  SettingGroupRead,
  ShippingCity,
} from "@/types/api";

export function useHeroes() {
  return useQuery({
    queryKey: ["content", "heroes"],
    queryFn: () => api.get<Hero[]>("/api/v1/content/heroes"),
  });
}

export function useSaveHero() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string; body: HeroWrite }) =>
      input.id
        ? api.patch<Hero>(`/api/v1/content/heroes/${input.id}`, input.body)
        : api.post<Hero>("/api/v1/content/heroes", input.body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["content", "heroes"] });
    },
  });
}

export function useSections() {
  return useQuery({
    queryKey: ["content", "sections"],
    queryFn: () => api.get<HomepageSection[]>("/api/v1/content/sections"),
  });
}

export function useUpdateSection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; body: Partial<HomepageSection> }) =>
      api.patch<HomepageSection>(`/api/v1/content/sections/${input.id}`, input.body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["content", "sections"] });
    },
  });
}

export function useReorderSections() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      api.patch<HomepageSection[]>("/api/v1/content/sections/reorder", { ids }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["content", "sections"] });
    },
  });
}

export function useSettingGroups() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<SettingGroupRead[]>("/api/v1/settings"),
  });
}

export function usePatchSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { group: SettingGroup; items: { key: string; value: string | null }[] }) =>
      api.patch<SettingGroupRead>(`/api/v1/settings/${input.group}`, { items: input.items }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useShippingCities() {
  return useQuery({
    queryKey: ["shipping-cities"],
    queryFn: () => api.get<ShippingCity[]>("/api/v1/shipping-cities"),
  });
}

export function useSaveShippingCity() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id?: string;
      body: { name: string; shipping_fee: string | null; is_active: boolean; sort_order: number };
    }) =>
      input.id
        ? api.patch<ShippingCity>(`/api/v1/shipping-cities/${input.id}`, input.body)
        : api.post<ShippingCity>("/api/v1/shipping-cities", input.body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["shipping-cities"] });
    },
  });
}

export function useDeleteShippingCity() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/shipping-cities/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["shipping-cities"] });
    },
  });
}

export function settingValue(groups: SettingGroupRead[] | undefined, group: SettingGroup, key: string) {
  const row = groups?.find((item) => item.group === group)?.items.find((item) => item.key === key);
  return row?.value ?? "";
}
