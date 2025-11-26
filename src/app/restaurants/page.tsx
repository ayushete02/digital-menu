import { headers } from "next/headers";
import Link from "next/link";
import { Store, MapPin } from "lucide-react";
import QRCode from "react-qr-code";

import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default async function RestaurantsPage() {
  const headerList = await headers();
  const caller = appRouter.createCaller(
    await createTRPCContext({ headers: new Headers(headerList) })
  );

  // Get all restaurants (public view)
  const restaurants = await caller.restaurants.listAll();

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://digitalmenu02.vercel.app";

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Browse Restaurants
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Scan a QR code to view digital menus
          </p>
        </div>

        {restaurants && restaurants.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => {
              const menuUrl = `${appUrl}/menu/${restaurant.slug}`;
              return (
                <Card
                  key={restaurant.id}
                  className="group overflow-hidden transition-all hover:shadow-xl"
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
                    <Link
                      href={`/menu/${restaurant.slug}`}
                      className="block bg-white p-4 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex justify-center">
                        <QRCode
                          value={menuUrl}
                          size={160}
                          style={{
                            height: "auto",
                            maxWidth: "100%",
                            width: "100%",
                          }}
                        />
                      </div>
                    </Link>
                    <p className="text-center text-xs text-muted-foreground">
                      Scan or tap QR code to view menu
                    </p>
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
