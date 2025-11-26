"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlignJustify,
  CircleDot,
  Flame,
  MapPin,
  UtensilsCrossed,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Separator } from "~/components/ui/separator";
import type { RouterOutputs } from "~/trpc/react";

const SCROLL_OFFSET = 120;

type MenuRestaurant = NonNullable<RouterOutputs["menu"]["bySlug"]>;

type CategorySection = {
  id: string;
  name: string;
  slug: string;
  dishes: MenuDish[];
  children: {
    id: string;
    name: string;
    slug: string;
    dishes: MenuDish[];
  }[];
};

type MenuDish =
  MenuRestaurant["categories"][number]["dishLinks"][number]["dish"];

type Props = {
  restaurant: MenuRestaurant;
};

export const MenuView = ({ restaurant }: Props) => {
  const sections = useMemo<CategorySection[]>(() => {
    return (restaurant.categories ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      dishes: category.dishLinks
        .map((link) => link.dish)
        .filter(Boolean) as MenuDish[],
      children: (category.children ?? []).map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        dishes: child.dishLinks
          .map((link) => link.dish)
          .filter(Boolean) as MenuDish[],
      })),
    }));
  }, [restaurant.categories]);

  const [activeSection, setActiveSection] = useState(
    () => sections[0]?.slug ?? ""
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const topEntry = visible[0];
        if (topEntry) {
          setActiveSection(topEntry.target.getAttribute("data-category") ?? "");
        }
      },
      {
        rootMargin: `-${SCROLL_OFFSET}px 0px -60% 0px`,
        threshold: [0, 0.25, 0.5],
      }
    );

    const elements = document.querySelectorAll<HTMLElement>("[data-category]");
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  const handleScrollTo = (slug: string) => {
    const target = document.getElementById(slug);
    if (target) {
      const y =
        target.getBoundingClientRect().top +
        window.scrollY -
        (SCROLL_OFFSET - 20);
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const activeLabel =
    sections.find((section) => section.slug === activeSection)?.name ??
    sections[0]?.name;

  return (
    <div className="relative min-h-screen bg-[#f3eeef] pb-24">
      <div className="sticky top-0 z-20 border-b border-[#e3d9da] bg-white/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-1">
          <div>
            <h1 className="text-xl font-semibold">{restaurant.name}</h1>
            {restaurant.location && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {restaurant.location}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 text-sm">
            <div className="font-medium uppercase tracking-[0.2em] text-[#a35568]">
              {activeLabel ?? "Menu"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CircleDot className="h-3 w-3" />
              Updated just now
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.slug}
            data-category={section.slug}
            className="space-y-4 rounded-3xl border border-[#eddfe1] bg-white p-4 shadow-sm"
          >
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#5a2432]">
                  {section.name}
                </h2>
                <p className="text-xs uppercase tracking-[0.25em] text-[#c07a87]">
                  Recommended
                </p>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-[#f1c7cf] text-[#a35568]"
              >
                {section.dishes.length +
                  section.children.reduce(
                    (sum, child) => sum + child.dishes.length,
                    0
                  )}{" "}
                items
              </Badge>
            </header>
            <div className="space-y-3">
              {section.dishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
              ))}
              {section.children.map((child) => (
                <div key={child.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Separator className="flex-1" />
                    <span className="text-sm font-medium uppercase tracking-[0.2em] text-[#a35568]">
                      {child.name}
                    </span>
                    <Separator className="flex-1" />
                  </div>
                  {child.dishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              ))}
              {!section.dishes.length && !section.children.length && (
                <p className="text-sm text-muted-foreground">No dishes yet.</p>
              )}
            </div>
          </section>
        ))}
        {!sections.length && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Menu is being prepared. Please check back soon.
            </CardContent>
          </Card>
        )}
      </main>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#d74664] px-6 py-3 text-white shadow-lg">
            <AlignJustify className="mr-2 h-4 w-4" /> Menu
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="h-[70vh] rounded-t-3xl bg-[#f9f5f6]"
        >
          <SheetHeader>
            <SheetTitle className="text-center text-[#5a2432]">
              Navigate menu
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="mt-4 h-full">
            <div className="space-y-6 px-2 pb-12">
              {sections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleScrollTo(section.slug)}
                    className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left shadow-sm"
                  >
                    <span className="font-medium text-[#5a2432]">
                      {section.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {section.dishes.length +
                        section.children.reduce(
                          (sum, child) => sum + child.dishes.length,
                          0
                        )}
                    </span>
                  </button>
                  {section.children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => handleScrollTo(child.slug)}
                      className="flex w-full items-center justify-between rounded-lg bg-white px-4 py-2 text-left text-sm text-muted-foreground shadow-sm"
                    >
                      <span>{child.name}</span>
                      <span>{child.dishes.length}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

type DishCardProps = {
  dish: MenuDish;
};

const DishCard = ({ dish }: DishCardProps) => {
  return (
    <Card className="border-none bg-[#fdf9f9] p-0 shadow-sm">
      <CardContent className="flex gap-3 p-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-3 w-3 text-[#d74664]" />
                <h3 className="font-semibold text-[#432029]">{dish.name}</h3>
              </div>
              {dish.spiceLevel && (
                <Badge
                  variant="outline"
                  className="mt-1 border-[#f1c7cf] text-[#a35568]"
                >
                  <Flame className="mr-1 h-3 w-3" /> {dish.spiceLevel}
                </Badge>
              )}
            </div>
            <div className="text-sm font-medium text-[#5a2432]">
              {dish.price
                ? `₹ ${Number(dish.price).toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}`
                : "—"}
            </div>
          </div>
          {dish.description && (
            <p className="text-sm leading-relaxed text-[#7a6266]">
              {dish.description}
            </p>
          )}
        </div>
        {dish.imageUrl ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#f1c7cf]">
            <Image
              src={dish.imageUrl}
              alt={dish.name}
              fill
              className="object-cover"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
