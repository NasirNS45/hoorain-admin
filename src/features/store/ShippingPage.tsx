import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FieldError, PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  shipping_fee: z.string(),
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
  const rates = useForm<RatesValues>({
    resolver: zodResolver(ratesSchema),
    defaultValues: { flat_fee: "250.00", free_threshold: "5000.00" },
  });
  const cityForm = useForm<CityValues>({
    resolver: zodResolver(citySchema),
    defaultValues: { name: "", shipping_fee: "", is_active: true },
  });

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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Store"
        title="Shipping"
        description="Default fee, free-delivery threshold, and optional city overrides. Pickup stays free."
      />
      <form
        className="max-w-2xl space-y-5 border border-border bg-card p-6"
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
          <Button type="submit" disabled={patch.isPending}>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>City</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              {canUpdateSettings ? <TableHead /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(cities.data ?? []).map((city) => (
              <TableRow key={city.id}>
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
            ))}
          </TableBody>
        </Table>
        {canUpdateSettings ? (
          <form className="grid gap-3 border-t border-border p-6 sm:grid-cols-[1fr_140px_auto]" onSubmit={cityForm.handleSubmit(onAddCity)}>
            <div>
              <Input placeholder="City name" {...cityForm.register("name")} />
              <FieldError message={cityForm.formState.errors.name?.message} />
            </div>
            <Input placeholder="Fee or blank" {...cityForm.register("shipping_fee")} />
            <Button type="submit" disabled={saveCity.isPending}>
              Add city
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
