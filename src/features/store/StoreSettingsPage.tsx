import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FieldError, PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingValue, usePatchSettings, useSettingGroups } from "@/hooks/useContent";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(1, "Brand name is required."),
  tagline: z.string(),
  url: z.string(),
  city: z.string(),
  email: z.string(),
  phone: z.string(),
  whatsapp: z.string(),
  footer: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function StoreSettingsPage() {
  const { canUpdateSettings } = usePermissions();
  const groups = useSettingGroups();
  const patch = usePatchSettings();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      tagline: "",
      url: "",
      city: "",
      email: "",
      phone: "",
      whatsapp: "",
      footer: "",
    },
  });

  useEffect(() => {
    if (!groups.data) return;
    form.reset({
      name: settingValue(groups.data, "BRAND", "name"),
      tagline: settingValue(groups.data, "BRAND", "tagline"),
      url: settingValue(groups.data, "BRAND", "url"),
      city: settingValue(groups.data, "CONTACT", "city"),
      email: settingValue(groups.data, "CONTACT", "email"),
      phone: settingValue(groups.data, "CONTACT", "phone"),
      whatsapp: settingValue(groups.data, "WHATSAPP", "number"),
      footer: settingValue(groups.data, "FOOTER", "line"),
    });
  }, [groups.data, form]);

  async function onSubmit(values: FormValues) {
    try {
      await patch.mutateAsync({
        group: "BRAND",
        items: [
          { key: "name", value: values.name },
          { key: "tagline", value: values.tagline.trim() || null },
          { key: "url", value: values.url.trim() || null },
        ],
      });
      await patch.mutateAsync({
        group: "CONTACT",
        items: [
          { key: "city", value: values.city.trim() || null },
          { key: "email", value: values.email.trim() || null },
          { key: "phone", value: values.phone.trim() || null },
        ],
      });
      await patch.mutateAsync({
        group: "WHATSAPP",
        items: [{ key: "number", value: values.whatsapp.trim() || null }],
      });
      await patch.mutateAsync({
        group: "FOOTER",
        items: [{ key: "line", value: values.footer.trim() || null }],
      });
      toast.success("Store settings saved.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not save settings.";
      toast.error(message);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Store"
        title="Settings"
        description="Brand name, contact, WhatsApp number, and footer copy used on the storefront."
      />
      <form className="space-y-5 border border-border bg-card p-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name">Brand name</Label>
          <Input id="name" disabled={!canUpdateSettings} {...form.register("name")} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" disabled={!canUpdateSettings} {...form.register("tagline")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">Store URL</Label>
          <Input id="url" disabled={!canUpdateSettings} {...form.register("url")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" disabled={!canUpdateSettings} {...form.register("city")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" disabled={!canUpdateSettings} {...form.register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" disabled={!canUpdateSettings} {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp number</Label>
            <Input id="whatsapp" disabled={!canUpdateSettings} {...form.register("whatsapp")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="footer">Footer line</Label>
          <Input id="footer" disabled={!canUpdateSettings} {...form.register("footer")} />
        </div>
        {canUpdateSettings ? (
          <Button type="submit" disabled={patch.isPending}>
            {patch.isPending ? "Saving" : "Save settings"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">STAFF and MANAGER can view settings. Only ADMIN can change them.</p>
        )}
      </form>
    </div>
  );
}
