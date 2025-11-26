"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2, Pizza } from "lucide-react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { api, type RouterOutputs } from "~/trpc/react";

const restaurantSchema = z.object({
  name: z.string().min(2).max(120),
  location: z.string().min(2).max(120),
});

const categorySchema = z.object({
  name: z.string().min(2).max(80),
  parentId: z.string().cuid().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

const dishSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(600).optional(),
  price: z.number().min(0).max(1_000_000).optional(),
  imageUrl: z.string().url().optional(),
  spiceLevel: z.string().max(50).optional(),
  categoryIds: z
    .array(z.string().cuid())
    .min(1, "Select at least one category"),
});

type RestaurantDetail = RouterOutputs["restaurants"]["detail"];

type Props = {
  restaurantId: string;
  initialData: RestaurantDetail;
};

export const RestaurantManager = ({ restaurantId, initialData }: Props) => {
  const router = useRouter();
  const restaurant = initialData;

  const updateRestaurant = api.restaurants.update.useMutation({
    onSuccess: () => {
      toast.success("Restaurant updated");
      router.refresh();
    },
    onError: (error) =>
      toast.error(error.message ?? "Unable to update restaurant"),
  });

  const createCategory = api.restaurants.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Category created");
      categoryForm.reset({
        name: "",
        parentId: undefined,
        displayOrder: undefined,
      });
      router.refresh();
    },
    onError: (error) =>
      toast.error(error.message ?? "Unable to create category"),
  });

  const createDish = api.restaurants.createDish.useMutation({
    onSuccess: () => {
      toast.success("Dish created");
      dishForm.reset({
        name: "",
        description: undefined,
        price: undefined,
        imageUrl: undefined,
        spiceLevel: undefined,
        categoryIds: [],
      });
      router.refresh();
    },
    onError: (error) => toast.error(error.message ?? "Unable to create dish"),
  });

  const restaurantForm = useForm<z.infer<typeof restaurantSchema>>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: restaurant.name,
      location: restaurant.location ?? "",
    },
  });

  const categoryForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", parentId: undefined, displayOrder: undefined },
  });

  const dishForm = useForm<z.infer<typeof dishSchema>>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      name: "",
      description: undefined,
      price: undefined,
      imageUrl: undefined,
      spiceLevel: undefined,
      categoryIds: [],
    },
  });

  const selectedCategories = dishForm.watch("categoryIds") ?? [];

  const flatCategories = useMemo(() => {
    const items: { id: string; label: string }[] = [];
    for (const category of restaurant.categories ?? []) {
      items.push({ id: category.id, label: category.name });
      for (const child of category.children ?? []) {
        items.push({ id: child.id, label: `${category.name} · ${child.name}` });
      }
    }
    return items;
  }, [restaurant.categories]);

  const topLevelCategories = useMemo(() => {
    return (restaurant.categories ?? []).map((category) => ({
      id: category.id,
      name: category.name,
    }));
  }, [restaurant.categories]);

  const onUpdateRestaurant = restaurantForm.handleSubmit((values) => {
    updateRestaurant.mutate({
      restaurantId,
      name: values.name.trim(),
      location: values.location.trim(),
    });
  });

  const onCreateCategory = categoryForm.handleSubmit((values) => {
    createCategory.mutate({
      restaurantId,
      name: values.name.trim(),
      parentId: values.parentId,
      displayOrder:
        values.displayOrder !== undefined && !Number.isNaN(values.displayOrder)
          ? values.displayOrder
          : undefined,
    });
  });

  const onCreateDish = dishForm.handleSubmit((values) => {
    createDish.mutate({
      restaurantId,
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      price:
        values.price !== undefined && !Number.isNaN(values.price)
          ? values.price
          : undefined,
      imageUrl: values.imageUrl?.trim() || undefined,
      spiceLevel: values.spiceLevel?.trim() || undefined,
      categoryIds: selectedCategories,
    });
  });

  const dishList = restaurant.dishes ?? [];

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard")}
        className="-ml-2"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to restaurants
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Restaurant details</CardTitle>
          <CardDescription>
            Update the basic information visible on the menu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...restaurantForm}>
            <form
              onSubmit={onUpdateRestaurant}
              className="flex flex-col gap-4 md:flex-row md:items-end"
            >
              <FormField
                control={restaurantForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Super Restaurant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={restaurantForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Mumbai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateRestaurant.isPending}>
                {updateRestaurant.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Create sections to group dishes on the digital menu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...categoryForm}>
              <form onSubmit={onCreateCategory} className="space-y-3">
                <FormField
                  control={categoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category name</FormLabel>
                      <FormControl>
                        <Input placeholder="Starters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={categoryForm.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent category (optional)</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : event.target.value
                            )
                          }
                          className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                        >
                          <option value="">None</option>
                          {topLevelCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={categoryForm.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display order (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(
                              value === ""
                                ? undefined
                                : Number.parseInt(value, 10)
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createCategory.isPending}>
                  {createCategory.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add category"
                  )}
                </Button>
              </form>
            </Form>
            <Separator />
            <ScrollArea className="h-64 rounded-md border">
              <div className="space-y-3 p-4">
                {(restaurant.categories ?? []).map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.dishLinks.length} dishes
                    </div>
                    {(category.children ?? []).length > 0 && (
                      <div className="space-y-1 rounded-md border border-dashed p-3">
                        {(category.children ?? []).map((child) => (
                          <div key={child.id} className="text-sm">
                            {child.name}{" "}
                            <span className="text-xs text-muted-foreground">
                              ({child.dishLinks.length} dishes)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {!(restaurant.categories ?? []).length && (
                  <p className="text-sm text-muted-foreground">
                    No categories yet. Start by creating your first section.
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dishes</CardTitle>
            <CardDescription>
              Add dishes and assign them to one or more categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...dishForm}>
              <form onSubmit={onCreateDish} className="space-y-3">
                <FormField
                  control={dishForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dish name</FormLabel>
                      <FormControl>
                        <Input placeholder="Apple Pie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={dishForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Describe the dish"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : event.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    control={dishForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="140"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(
                                value === ""
                                  ? undefined
                                  : Number.parseFloat(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={dishForm.control}
                    name="spiceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spice level (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mild"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(event) =>
                              field.onChange(
                                event.target.value === ""
                                  ? undefined
                                  : event.target.value
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={dishForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : event.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <FormLabel>Assign categories</FormLabel>
                  <div className="grid gap-2 md:grid-cols-2">
                    {flatCategories.map((category) => {
                      const isSelected = selectedCategories.includes(
                        category.id
                      );
                      return (
                        <label
                          key={category.id}
                          className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition hover:bg-muted ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-muted"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={isSelected}
                            onChange={(event) => {
                              dishForm.setValue(
                                "categoryIds",
                                event.target.checked
                                  ? [...selectedCategories, category.id]
                                  : selectedCategories.filter(
                                      (id) => id !== category.id
                                    )
                              );
                            }}
                          />
                          <span>{category.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  {!flatCategories.length && (
                    <p className="text-sm text-muted-foreground">
                      Create categories first to be able to assign dishes.
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={createDish.isPending || !flatCategories.length}
                >
                  {createDish.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add dish"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu preview</CardTitle>
          <CardDescription>
            Snapshot of dishes currently assigned to categories. Use the public
            link for the full customer view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            <div className="grid gap-3 p-2">
              {dishList.map((dish) => {
                const categoryNames = dish.categories
                  .map(
                    (link) =>
                      flatCategories.find((item) => item.id === link.categoryId)
                        ?.label
                  )
                  .filter((name): name is string => Boolean(name));
                return (
                  <div key={dish.id} className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium">{dish.name}</div>
                        {dish.description && (
                          <p className="text-sm text-muted-foreground">
                            {dish.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        {dish.price ? `₹ ${dish.price.toString()}` : "—"}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Pizza className="h-3 w-3" />
                      {categoryNames.length
                        ? categoryNames.join(", ")
                        : "No categories"}
                    </div>
                  </div>
                );
              })}
              {!dishList.length && (
                <p className="text-sm text-muted-foreground">
                  Add dishes to see them listed here.
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
