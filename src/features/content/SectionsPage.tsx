import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FieldError, PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReorderSections, useSections, useUpdateSection } from "@/hooks/useContent";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";
import type { HomepageSection } from "@/types/api";

const schema = z.object({
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  image: z.string(),
  mobile_image: z.string(),
  button_text: z.string(),
  button_url: z.string(),
  is_visible: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const SECTION_LABEL: Record<string, string> = {
  HERO: "Hero",
  NEW_ARRIVALS: "New arrivals",
  OUR_EDIT: "Our edit",
  SHOP_BY_CATEGORY: "Shop by category",
  HOORAIN_EDIT: "The HOORAIN Edit",
  BRAND_STORY: "Brand story",
  INSTAGRAM: "Instagram",
  NEWSLETTER: "Newsletter",
};

export function SectionsPage() {
  const { canUpdateContent } = usePermissions();
  const sections = useSections();
  const updateSection = useUpdateSection();
  const reorder = useReorderSections();
  const rows = sections.data ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find((item) => item.id === selectedId) ?? rows[0];
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      image: "",
      mobile_image: "",
      button_text: "",
      button_url: "",
      is_visible: true,
    },
  });

  useEffect(() => {
    if (!selected) return;
    form.reset({
      title: selected.title ?? "",
      subtitle: selected.subtitle ?? "",
      description: selected.description ?? "",
      image: selected.image ?? "",
      mobile_image: selected.mobile_image ?? "",
      button_text: selected.button_text ?? "",
      button_url: selected.button_url ?? "",
      is_visible: selected.is_visible,
    });
  }, [selected, form]);

  async function move(section: HomepageSection, direction: -1 | 1) {
    const ids = rows.map((item) => item.id);
    const index = ids.indexOf(section.id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= ids.length) return;
    const swapped = [...ids];
    const current = swapped[index];
    const neighbour = swapped[next];
    if (!current || !neighbour) return;
    swapped[index] = neighbour;
    swapped[next] = current;
    try {
      await reorder.mutateAsync(swapped);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not reorder sections.";
      toast.error(message);
    }
  }

  async function onSubmit(values: FormValues) {
    if (!selected) return;
    try {
      await updateSection.mutateAsync({
        id: selected.id,
        body: {
          title: values.title.trim() || null,
          subtitle: values.subtitle.trim() || null,
          description: values.description.trim() || null,
          image: values.image.trim() || null,
          mobile_image: values.mobile_image.trim() || null,
          button_text: values.button_text.trim() || null,
          button_url: values.button_url.trim() || null,
          is_visible: values.is_visible,
        },
      });
      toast.success("Section saved.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not save this section.";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Sections"
        description="Show, hide, and reorder the eight homepage blocks. Product grids still come from the catalogue."
      />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <ul className="border border-border bg-card">
          {rows.map((section, index) => (
            <li key={section.id} className="border-b border-border last:border-b-0">
              <button
                type="button"
                className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm ${
                  selected?.id === section.id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedId(section.id)}
              >
                <span>{SECTION_LABEL[section.section_type] ?? section.section_type}</span>
                <Badge variant={section.is_visible ? "secondary" : "outline"}>
                  {section.is_visible ? "On" : "Off"}
                </Badge>
              </button>
              {canUpdateContent ? (
                <div className="flex gap-2 px-4 pb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={index === 0 || reorder.isPending}
                    onClick={() => void move(section, -1)}
                  >
                    Up
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={index === rows.length - 1 || reorder.isPending}
                    onClick={() => void move(section, 1)}
                  >
                    Down
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
        {selected ? (
          <form className="space-y-5 border border-border bg-card p-6" onSubmit={form.handleSubmit(onSubmit)}>
            <p className="eyebrow text-muted-foreground">
              {SECTION_LABEL[selected.section_type] ?? selected.section_type}
            </p>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" disabled={!canUpdateContent} {...form.register("title")} />
              <FieldError message={form.formState.errors.title?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" disabled={!canUpdateContent} {...form.register("subtitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" disabled={!canUpdateContent} {...form.register("description")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" disabled={!canUpdateContent} {...form.register("image")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile_image">Mobile image URL</Label>
                <Input id="mobile_image" disabled={!canUpdateContent} {...form.register("mobile_image")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button_text">Button</Label>
                <Input id="button_text" disabled={!canUpdateContent} {...form.register("button_text")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button_url">Button URL</Label>
                <Input id="button_url" disabled={!canUpdateContent} {...form.register("button_url")} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" disabled={!canUpdateContent} {...form.register("is_visible")} />
              Visible on the storefront
            </label>
            {canUpdateContent ? (
              <Button type="submit" disabled={updateSection.isPending}>
                {updateSection.isPending ? "Saving" : "Save section"}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">You can view sections, but STAFF cannot change them.</p>
            )}
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">No homepage sections yet. Run the seed.</p>
        )}
      </div>
    </div>
  );
}
