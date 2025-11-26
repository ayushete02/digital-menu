"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clipboard, Loader2, LogOut, Plus, Share, Store } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

  const form = useForm<RestaurantValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: { name: "", location: "" },
  });

  const origin = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_APP_URL ?? "";
  }, []);

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

      <div className="grid gap-4 md:grid-cols-2">
        {restaurants?.map((restaurant) => (
          <Card key={restaurant.id} className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <span>{restaurant.name}</span>
              </CardTitle>
              <CardDescription>{restaurant.location}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => handleCopyLink(restaurant.slug)}
              >
                <Share className="mr-2 h-4 w-4" /> Share menu
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/dashboard/restaurants/${restaurant.id}`)
                }
              >
                Manage menu
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleCopyLink(restaurant.slug)}
              >
                <Clipboard className="mr-2 h-4 w-4" /> QR page link
              </Button>
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
    </div>
  );
};
