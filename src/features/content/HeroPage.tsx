import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/ImageUploadField";
import { PanelSkeleton } from "@/components/loading";
import { FieldError, PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHeroes, useSaveHero } from "@/hooks/useContent";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";

const schema = z.object({
  heading: z.string().trim().min(1, "Heading is required."),
  subtitle: z.string(),
  description: z.string(),
  desktop_image: z.string(),
  mobile_image: z.string(),
  primary_cta_text: z.string(),
  primary_cta_url: z.string(),
  secondary_cta_text: z.string(),
  secondary_cta_url: z.string(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function HeroPage() {
  const { canUpdateContent } = usePermissions();
  const heroes = useHeroes();
  const save = useSaveHero();
  const current = heroes.data?.find((item) => item.is_active) ?? heroes.data?.[0];
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      heading: "",
      subtitle: "",
      description: "",
      desktop_image: "",
      mobile_image: "",
      primary_cta_text: "",
      primary_cta_url: "",
      secondary_cta_text: "",
      secondary_cta_url: "",
      is_active: true,
    },
  });
  const desktopImage = useWatch({ control: form.control, name: "desktop_image" }) ?? "";
  const mobileImage = useWatch({ control: form.control, name: "mobile_image" }) ?? "";

  useEffect(() => {
    if (!current) return;
    form.reset({
      heading: current.heading,
      subtitle: current.subtitle ?? "",
      description: current.description ?? "",
      desktop_image: current.desktop_image ?? "",
      mobile_image: current.mobile_image ?? "",
      primary_cta_text: current.primary_cta_text ?? "",
      primary_cta_url: current.primary_cta_url ?? "",
      secondary_cta_text: current.secondary_cta_text ?? "",
      secondary_cta_url: current.secondary_cta_url ?? "",
      is_active: current.is_active,
    });
  }, [current, form]);

  async function onSubmit(values: FormValues) {
    try {
      await save.mutateAsync({
        id: current?.id,
        body: {
          heading: values.heading,
          subtitle: values.subtitle.trim() || null,
          description: values.description.trim() || null,
          desktop_image: values.desktop_image.trim() || null,
          mobile_image: values.mobile_image.trim() || null,
          primary_cta_text: values.primary_cta_text.trim() || null,
          primary_cta_url: values.primary_cta_url.trim() || null,
          secondary_cta_text: values.secondary_cta_text.trim() || null,
          secondary_cta_url: values.secondary_cta_url.trim() || null,
          is_active: values.is_active,
        },
      });
      toast.success("Hero saved. Only one hero stays active.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not save the hero.";
      toast.error(message);
    }
  }

  if (heroes.isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <PageHeader
          eyebrow="Content"
          title="Hero"
          description="Heading, images, and both CTAs. Activating this hero turns the others off."
        />
        <PanelSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Hero"
        description="Heading, images, and both CTAs. Activating this hero turns the others off."
      />
      <form className="space-y-5 border border-border bg-card p-6" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="heading">Heading</Label>
          <Textarea id="heading" disabled={!canUpdateContent} {...form.register("heading")} />
          <FieldError message={form.formState.errors.heading?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Eyebrow</Label>
          <Input id="subtitle" disabled={!canUpdateContent} {...form.register("subtitle")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" disabled={!canUpdateContent} {...form.register("description")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploadField
            id="desktop_image"
            label="Desktop image URL"
            folder="cms"
            disabled={!canUpdateContent}
            value={desktopImage}
            onChange={(value) => form.setValue("desktop_image", value, { shouldDirty: true })}
          />
          <ImageUploadField
            id="mobile_image"
            label="Mobile image URL"
            folder="cms"
            disabled={!canUpdateContent}
            value={mobileImage}
            onChange={(value) => form.setValue("mobile_image", value, { shouldDirty: true })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primary_cta_text">Primary CTA</Label>
            <Input id="primary_cta_text" disabled={!canUpdateContent} {...form.register("primary_cta_text")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary_cta_url">Primary URL</Label>
            <Input id="primary_cta_url" disabled={!canUpdateContent} {...form.register("primary_cta_url")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary_cta_text">Secondary CTA</Label>
            <Input id="secondary_cta_text" disabled={!canUpdateContent} {...form.register("secondary_cta_text")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary_cta_url">Secondary URL</Label>
            <Input id="secondary_cta_url" disabled={!canUpdateContent} {...form.register("secondary_cta_url")} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" disabled={!canUpdateContent} {...form.register("is_active")} />
          Active
        </label>
        {canUpdateContent ? (
          <Button type="submit" pending={save.isPending}>
            {save.isPending ? "Saving" : "Save hero"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">You can view the hero, but STAFF cannot change it.</p>
        )}
      </form>
    </div>
  );
}
