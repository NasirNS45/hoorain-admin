import { Link } from "react-router";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHeroes, useSections, useUpdateSection } from "@/hooks/useContent";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";

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

export function HomepagePage() {
  const { canUpdateContent } = usePermissions();
  const heroes = useHeroes();
  const sections = useSections();
  const updateSection = useUpdateSection();
  const active = heroes.data?.find((item) => item.is_active) ?? heroes.data?.[0] ?? null;

  async function toggleVisible(id: string, isVisible: boolean) {
    try {
      await updateSection.mutateAsync({ id, body: { is_visible: !isVisible } });
      toast.success(isVisible ? "Section hidden on the storefront." : "Section shown on the storefront.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not update this section.";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Homepage"
        description="The live storefront reads this copy. Hide a section here and it drops off the home page."
        action={
          <Button asChild variant="outline">
            <Link to="/content/hero">Edit hero</Link>
          </Button>
        }
      />

      {active ? (
        <div className="border border-border bg-card p-6">
          <p className="eyebrow text-muted-foreground">Active hero</p>
          <h2 className="mt-2 font-display text-3xl whitespace-pre-line">{active.heading}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{active.subtitle}</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{active.description}</p>
        </div>
      ) : (
        <EmptyState
          title="No hero yet"
          body="Add a hero so the storefront can show The New Edit."
          action={{ to: "/content/hero", label: "Add hero" }}
        />
      )}

      <div className="border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-2xl">Sections</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/content/sections">Edit sections</Link>
          </Button>
        </div>
        <ul>
          {(sections.data ?? []).map((section) => (
            <li
              key={section.id}
              className="flex items-center justify-between gap-4 border-b border-border px-6 py-3 last:border-b-0"
            >
              <div>
                <p className="text-sm">{SECTION_LABEL[section.section_type] ?? section.section_type}</p>
                <p className="text-xs text-muted-foreground">{section.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={section.is_visible ? "secondary" : "outline"}>
                  {section.is_visible ? "Visible" : "Hidden"}
                </Badge>
                {canUpdateContent ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updateSection.isPending}
                    onClick={() => void toggleVisible(section.id, section.is_visible)}
                  >
                    {section.is_visible ? "Hide" : "Show"}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
