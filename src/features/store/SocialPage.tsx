import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingValue, usePatchSettings, useSettingGroups } from "@/hooks/useContent";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";

const schema = z.object({
  instagram_url: z.string(),
  instagram_handle: z.string(),
  facebook_url: z.string(),
  tiktok_url: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function SocialPage() {
  const { canUpdateSettings } = usePermissions();
  const groups = useSettingGroups();
  const patch = usePatchSettings();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      instagram_url: "",
      instagram_handle: "",
      facebook_url: "",
      tiktok_url: "",
    },
  });

  useEffect(() => {
    if (!groups.data) return;
    form.reset({
      instagram_url: settingValue(groups.data, "SOCIAL", "instagram_url"),
      instagram_handle: settingValue(groups.data, "SOCIAL", "instagram_handle"),
      facebook_url: settingValue(groups.data, "SOCIAL", "facebook_url"),
      tiktok_url: settingValue(groups.data, "SOCIAL", "tiktok_url"),
    });
  }, [groups.data, form]);

  async function onSubmit(values: FormValues) {
    try {
      await patch.mutateAsync({
        group: "SOCIAL",
        items: [
          { key: "instagram_url", value: values.instagram_url.trim() || null },
          { key: "instagram_handle", value: values.instagram_handle.trim() || null },
          { key: "facebook_url", value: values.facebook_url.trim() || null },
          { key: "tiktok_url", value: values.tiktok_url.trim() || null },
        ],
      });
      toast.success("Social links saved.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not save social links.";
      toast.error(message);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Store"
        title="Social Links"
        description="Instagram, Facebook, and TikTok URLs for the footer and follow section."
      />
      <form className="space-y-5 border border-border bg-card p-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="instagram_url">Instagram URL</Label>
          <Input id="instagram_url" disabled={!canUpdateSettings} {...form.register("instagram_url")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram_handle">Instagram handle</Label>
          <Input id="instagram_handle" disabled={!canUpdateSettings} {...form.register("instagram_handle")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="facebook_url">Facebook URL</Label>
          <Input id="facebook_url" disabled={!canUpdateSettings} {...form.register("facebook_url")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tiktok_url">TikTok URL</Label>
          <Input id="tiktok_url" disabled={!canUpdateSettings} {...form.register("tiktok_url")} />
        </div>
        {canUpdateSettings ? (
          <Button type="submit" disabled={patch.isPending}>
            {patch.isPending ? "Saving" : "Save links"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">You can view social links. Only ADMIN can change them.</p>
        )}
      </form>
    </div>
  );
}
