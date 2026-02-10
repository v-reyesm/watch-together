import Link from "next/link";
import { ChevronRightIcon, SettingsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <div className="container flex flex-col gap-8 py-6 md:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profile</h1>
        <p className="text-muted-foreground">Your account and preferences</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold">
              VI
            </div>
            <div>
              <CardTitle>Victor</CardTitle>
              <p className="text-muted-foreground text-sm">
                victor.reyes.medina@gmail.com
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="display-name" className="text-sm font-medium">
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              defaultValue="Victor"
              className="border-input bg-background ring-ring/50 focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-2"
            />
          </div>

          <Link
            href="/config"
            className="border-border hover:bg-accent/50 flex items-center justify-between gap-2 rounded-lg border px-3 py-3 transition-colors"
          >
            <span className="flex items-center gap-2">
              <SettingsIcon className="text-muted-foreground size-4" />
              <span className="text-sm font-medium">Appearance & theme</span>
            </span>
            <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
          </Link>

          <div className="flex flex-col gap-2 pt-4">
            <Button>Save</Button>
            <Button variant="ghost" className="justify-start text-muted-foreground">
              Sign out →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
