"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Plus, QrCode, Share, Store } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import QRCode from "react-qr-code";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { api, type RouterOutputs } from "~/trpc/react";

const restaurantSchema = z.object({
  name: z.string().min(2).max(120),
  location: z.string().min(2).max(120),
});

type RestaurantValues = z.infer<typeof restaurantSchema>;
type RestaurantSummary = RouterOutputs["restaurants"]["list"][number];

type DashboardViewProps = {
  user: NonNullable<RouterOutputs["auth"]["current"]>;
  initialRestaurants: RouterOutputs["restaurants"]["list"];
};

export const DashboardView = ({
  user,
  initialRestaurants,
}: DashboardViewProps) => {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: restaurants } = api.restaurants.list.useQuery(undefined, {
    initialData: initialRestaurants,
  });
  const createRestaurant = api.restaurants.create.useMutation({
    onSuccess: async () => {
      await utils.restaurants.list.invalidate();
      toast.success("Restaurant created");
      setCreateOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Unable to create restaurant");
    },
  });

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.replace("/login");
    router.refresh();
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrRestaurant, setQrRestaurant] = useState<RestaurantSummary | null>(
    null
  );

  const form = useForm<RestaurantValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: { name: "", location: "" },
  });

  const origin = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_APP_URL ?? "";
  }, []);

  const menuLink = useMemo(() => {
    if (!qrRestaurant) return "";
    return `${origin}/menu/${qrRestaurant.slug}`;
  }, [origin, qrRestaurant]);

  const handleCopyLink = async (slug: string) => {
    const link = `${origin}/menu/${slug}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Share link copied", { description: link });
    } catch (error) {
      console.error(error);
      toast.error("Unable to copy link", { description: link });
    }
  };

  const handleShowQr = (restaurant: RestaurantSummary) => {
    setQrRestaurant(restaurant);
    setQrOpen(true);
  };

  const handleDownloadQr = () => {
    if (typeof window === "undefined" || !qrRestaurant) return;
    const svg = document.getElementById("restaurant-qr-code");
    if (!(svg instanceof SVGElement)) {
      toast.error("Unable to download QR code");
      return;
    }

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${qrRestaurant.slug}-menu-qr.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onSubmit = (values: RestaurantValues) => {
    createRestaurant.mutate(values);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Hi, {user.name}</h1>
          <p className="text-muted-foreground">
            Manage your restaurants and publish QR-ready digital menus.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{user.email}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <Separator />

      <section className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Restaurants</h2>
          <p className="text-sm text-muted-foreground">
            Create restaurants and share their menus via QR code or link.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New restaurant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create restaurant</DialogTitle>
              <DialogDescription>
                Provide the basic details. You can customise the menu after
                creating it.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant name</FormLabel>
                      <FormControl>
                        <Input placeholder="Super Restaurant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Mumbai" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createRestaurant.isPending}
                    className="w-full"
                  >
                    {createRestaurant.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {restaurants?.map((restaurant) => (
          <Card key={restaurant.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <span>{restaurant.name}</span>
              </CardTitle>
              <CardDescription>{restaurant.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Share Link Section */}
              <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Share className="h-3 w-3" />
                  <span>Share Link</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-background px-2 py-1.5 text-xs font-mono truncate">
                    {origin}/menu/{restaurant.slug}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyLink(restaurant.slug)}
                    className="shrink-0"
                  >
                    <Share className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    router.push(`/dashboard/restaurants/${restaurant.id}`)
                  }
                >
                  Manage Menu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShowQr(restaurant)}
                >
                  <QrCode className="mr-1.5 h-4 w-4" /> QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!restaurants?.length && (
          <Card className="col-span-full border-dashed">
            <CardHeader>
              <CardTitle>No restaurants yet</CardTitle>
              <CardDescription>
                Create your first restaurant to start building the digital menu
                experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create restaurant
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog
        open={qrOpen}
        onOpenChange={(open) => {
          setQrOpen(open);
          if (!open) setQrRestaurant(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Menu QR Code</DialogTitle>
            <DialogDescription>
              Customers can scan this code to instantly access your digital menu
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrRestaurant ? (
              <>
                <div className="space-y-2 text-center">
                  <h3 className="font-semibold text-lg">{qrRestaurant.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {qrRestaurant.location}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-lg border-2 border-primary/10">
                  <QRCode
                    id="restaurant-qr-code"
                    value={menuLink || ""}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <div className="w-full space-y-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">
                      Menu URL
                    </div>
                    <code className="text-xs font-mono break-all">
                      {menuLink}
                    </code>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() =>
                        qrRestaurant && handleCopyLink(qrRestaurant.slug)
                      }
                    >
                      <Share className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={handleDownloadQr}
                    >
                      Download QR
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-sm text-muted-foreground">
                Select a restaurant to generate a QR code.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
