import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PanelSkeleton } from "@/components/loading";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { settingValue, usePatchSettings, useSettingGroups } from "@/hooks/useContent";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";

const schema = z.object({
  shipping: z.string(),
  returns: z.string(),
  privacy: z.string(),
  terms: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function PoliciesPage() {
  const { canUpdateSettings } = usePermissions();
  const groups = useSettingGroups();
  const patch = usePatchSettings();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { shipping: "", returns: "", privacy: "", terms: "" },
  });

  useEffect(() => {
    if (!groups.data) return;
    form.reset({
      shipping: settingValue(groups.data, "POLICIES", "shipping"),
      returns: settingValue(groups.data, "POLICIES", "returns"),
      privacy: settingValue(groups.data, "POLICIES", "privacy"),
      terms: settingValue(groups.data, "POLICIES", "terms"),
    });
  }, [groups.data, form]);

  async function onSubmit(values: FormValues) {
    try {
      await patch.mutateAsync({
        group: "POLICIES",
        items: [
          { key: "shipping", value: values.shipping.trim() || null },
          { key: "returns", value: values.returns.trim() || null },
          { key: "privacy", value: values.privacy.trim() || null },
          { key: "terms", value: values.terms.trim() || null },
        ],
      });
      toast.success("Policies saved.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not save policies.";
      toast.error(message);
    }
  }

  if (groups.isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <PageHeader
          eyebrow="Store"
          title="Policies"
          description="Shipping, returns, privacy, and terms used on product accordions and help pages."
        />
        <PanelSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Store"
        title="Policies"
        description="Shipping, returns, privacy, and terms used on product accordions and help pages."
      />
      <form className="space-y-5 border border-border bg-card p-6" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="shipping">Shipping</Label>
          <Textarea id="shipping" rows={5} disabled={!canUpdateSettings} {...form.register("shipping")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="returns">Returns</Label>
          <Textarea id="returns" rows={5} disabled={!canUpdateSettings} {...form.register("returns")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="privacy">Privacy</Label>
          <Textarea id="privacy" rows={4} disabled={!canUpdateSettings} {...form.register("privacy")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="terms">Terms</Label>
          <Textarea id="terms" rows={4} disabled={!canUpdateSettings} {...form.register("terms")} />
        </div>
        {canUpdateSettings ? (
          <Button type="submit" pending={patch.isPending}>
            {patch.isPending ? "Saving" : "Save policies"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">You can read policies. Only ADMIN can change them.</p>
        )}
      </form>
    </div>
  );
}
