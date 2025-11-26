import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { UtensilsCrossed } from "lucide-react";

export default function MenuNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3eeef] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Menu not found</CardTitle>
          <CardDescription>
            This restaurant menu doesn't exist or is no longer available.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            If you scanned a QR code, please ask the restaurant staff for
            assistance.
          </p>
          <Link href="/">
            <Button className="w-full" variant="outline">
              Go to home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
