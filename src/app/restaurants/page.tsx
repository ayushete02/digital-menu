"use client";

import { useState } from "react";
import Link from "next/link";
import { Store, MapPin, Share2, Copy, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";

import { api } from "~/trpc/react";

export default function RestaurantsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { data: restaurants, isLoading } = api.restaurants.listAll.useQuery();

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://digitalmenu02.vercel.app";

  const handleCopyLink = (slug: string, restaurantId: string) => {
    const menuUrl = `${appUrl}/menu/${slug}`;
    void navigator.clipboard.writeText(menuUrl);
    setCopiedId(restaurantId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (name: string, slug: string) => {
    const menuUrl = `${appUrl}/menu/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} - Digital Menu`,
          text: `Check out the menu at ${name}`,
          url: menuUrl,
        });
      } catch (err) {
        // User cancelled share or error occurred
        console.error("Share failed:", err);
      }
    } else {
      // Fallback to copy
      void navigator.clipboard.writeText(menuUrl);
      setCopiedId(slug);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Browse Restaurants
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              View digital menus from our restaurants
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Browse Restaurants
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              View digital menus from our restaurants
            </p>
          </div>        {restaurants && restaurants.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => {
              const menuUrl = `${appUrl}/menu/${restaurant.slug}`;
              return (
                <Card
                  key={restaurant.id}
                  className="group overflow-hidden transition-all hover:shadow-xl cursor-pointer"
                  onClick={() => window.location.href = `/menu/${restaurant.slug}`}
                >
                  <CardHeader className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      <span className="line-clamp-1">{restaurant.name}</span>
                    </CardTitle>
                    {restaurant.location && (
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="line-clamp-1">
                          {restaurant.location}
                        </span>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleShare(restaurant.name, restaurant.slug)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleCopyLink(restaurant.slug, restaurant.id)}
                      >
                        {copiedId === restaurant.id ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>No restaurants available</CardTitle>
              <CardDescription>
                Check back soon for digital menus
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Restaurant owner?{" "}
            <Link
              href="/dashboard"
              className="font-medium text-primary hover:underline"
            >
              Manage your menus
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
