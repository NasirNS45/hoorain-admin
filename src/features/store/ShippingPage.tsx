import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PanelSkeleton } from "@/components/loading";
import { FieldError, PageHeader, boolSelectValue, parseOptionalBool } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  settingValue,
  useDeleteShippingCity,
  usePatchSettings,
  useSaveShippingCity,
  useSettingGroups,
  useShippingCities,
} from "@/hooks/useContent";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";
import { formatPkr } from "@/lib/utils";

const ratesSchema = z.object({
  flat_fee: z.string().trim().min(1, "A default fee is required."),
  free_threshold: z.string().trim().min(1, "A free-delivery threshold is required."),
});

const citySchema = z.object({
  name: z.string().trim().min(1, "City name is required."),
  shipping_fee: z.string().refine(
    (value) => {
      const trimmed = value.trim();
      if (!trimmed) return true;
      return Number.isFinite(Number(trimmed));
    },
    { message: "Enter a fee in PKR." },
  ),
  is_active: z.boolean(),
});

type RatesValues = z.infer<typeof ratesSchema>;
type CityValues = z.infer<typeof citySchema>;

export function ShippingPage() {
  const { canUpdateSettings } = usePermissions();
  const groups = useSettingGroups();
  const cities = useShippingCities();
  const patch = usePatchSettings();
  const saveCity = useSaveShippingCity();
  const removeCity = useDeleteShippingCity();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [cityQ, setCityQ] = useState("");
  const [cityActive, setCityActive] = useState<boolean | undefined>(undefined);
  const rates = useForm<RatesValues>({
    resolver: zodResolver(ratesSchema),
    defaultValues: { flat_fee: "250.00", free_threshold: "5000.00" },
  });
  const cityForm = useForm<CityValues>({
    resolver: zodResolver(citySchema),
    defaultValues: { name: "", shipping_fee: "", is_active: true },
  });

  const filteredCities = useMemo(() => {
    const rows = cities.data ?? [];
    const needle = cityQ.trim().toLowerCase();
    return rows.filter((city) => {
      if (needle && !city.name.toLowerCase().includes(needle)) return false;
      if (cityActive !== undefined && city.is_active !== cityActive) return false;
      return true;
    });
  }, [cities.data, cityQ, cityActive]);

  useEffect(() => {
    if (!groups.data) return;
    rates.reset({
      flat_fee: settingValue(groups.data, "SHIPPING", "flat_fee") || "250.00",
      free_threshold: settingValue(groups.data, "SHIPPING", "free_threshold") || "5000.00",
    });
  }, [groups.data, rates]);

  async function onSaveRates(values: RatesValues) {
    try {
      await patch.mutateAsync({
        group: "SHIPPING",
        items: [
          { key: "flat_fee", value: values.flat_fee },
          { key: "free_threshold", value: values.free_threshold },
        ],
      });
      toast.success("Shipping rates saved.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not save shipping rates.";
      toast.error(message);
    }
  }

  async function onAddCity(values: CityValues) {
    try {
      await saveCity.mutateAsync({
        body: {
          name: values.name,
          shipping_fee: values.shipping_fee.trim() || null,
          is_active: values.is_active,
          sort_order: (cities.data?.length ?? 0) + 1,
        },
      });
      cityForm.reset({ name: "", shipping_fee: "", is_active: true });
      toast.success("City added.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not add this city.";
      toast.error(message);
    }
  }

  async function handleDelete() {
    if (!pendingId) return;
    try {
      await removeCity.mutateAsync(pendingId);
      toast.success("City removed.");
      setPendingId(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not remove this city.";
      toast.error(message);
    }
  }

  if (groups.isLoading || cities.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Store"
          title="Shipping"
          description="Default fee, free-delivery threshold, and optional city overrides. Pickup stays free."
        />
        <PanelSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Store"
        title="Shipping"
        description="Default fee, free-delivery threshold, and optional city overrides. Pickup stays free."
      />
      <form
        className="max-w-2xl space-y-5 border border-border bg-card p-6"
        noValidate
        onSubmit={rates.handleSubmit(onSaveRates)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="flat_fee">Default fee (PKR)</Label>
            <Input id="flat_fee" disabled={!canUpdateSettings} {...rates.register("flat_fee")} />
            <FieldError message={rates.formState.errors.flat_fee?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="free_threshold">Free above (PKR)</Label>
            <Input id="free_threshold" disabled={!canUpdateSettings} {...rates.register("free_threshold")} />
            <FieldError message={rates.formState.errors.free_threshold?.message} />
          </div>
        </div>
        {canUpdateSettings ? (
          <Button type="submit" pending={patch.isPending}>
            {patch.isPending ? "Saving" : "Save rates"}
          </Button>
        ) : null}
      </form>

      <div className="border border-border bg-card">
        <div className="px-6 py-4">
          <h2 className="font-display text-2xl">Cities</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Leave the fee blank to use the default. An override only applies below the free threshold.
          </p>
        </div>
        <form
          className="flex flex-wrap gap-2 border-t border-border px-6 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setCityQ(String(form.get("q") ?? ""));
            setCityActive(parseOptionalBool(form.get("is_active")));
          }}
        >
          <Input name="q" placeholder="Search city" className="max-w-xs" defaultValue={cityQ} />
          <NativeSelect name="is_active" className="w-36" defaultValue={boolSelectValue(cityActive)}>
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Off</option>
          </NativeSelect>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              {canUpdateSettings ? <TableHead /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCities.length ? (
              filteredCities.map((city, index) => (
                <TableRow key={city.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{city.name}</TableCell>
                  <TableCell>{city.shipping_fee ? formatPkr(city.shipping_fee) : "Default"}</TableCell>
                  <TableCell>
                    <Badge variant={city.is_active ? "secondary" : "outline"}>
                      {city.is_active ? "Active" : "Off"}
                    </Badge>
                  </TableCell>
                  {canUpdateSettings ? (
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setPendingId(city.id)}>
                        Remove
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={canUpdateSettings ? 5 : 4}
                  className="text-muted-foreground"
                >
                  {(cities.data ?? []).length ? "No cities match." : "No cities yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {canUpdateSettings ? (
          <form className="grid gap-3 border-t border-border p-6 sm:grid-cols-[1fr_140px_auto]" noValidate onSubmit={cityForm.handleSubmit(onAddCity)}>
            <div>
              <Input placeholder="City name" {...cityForm.register("name")} />
              <FieldError message={cityForm.formState.errors.name?.message} />
            </div>
            <div>
              <Input placeholder="Fee or blank" {...cityForm.register("shipping_fee")} />
              <FieldError message={cityForm.formState.errors.shipping_fee?.message} />
            </div>
            <Button type="submit" pending={saveCity.isPending}>
              {saveCity.isPending ? "Adding" : "Add city"}
            </Button>
          </form>
        ) : null}
      </div>
      <ConfirmDialog
        open={Boolean(pendingId)}
        title="Remove this city?"
        body="Checkout will fall back to the default shipping fee for this city."
        confirmLabel="Remove"
        pending={removeCity.isPending}
        onOpenChange={(open) => {
          if (!open) setPendingId(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
