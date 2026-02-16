import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListIcon, EyeIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="container flex flex-col gap-8 py-6 md:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Home</h1>
        <p className="text-muted-foreground">Your watchlist overview</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lists</CardTitle>
            <ListIcon className="text-muted-foreground size-5" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-muted-foreground text-xs">watchlists</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watched</CardTitle>
            <EyeIcon className="text-muted-foreground size-5" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">0/0</p>
            <p className="text-muted-foreground text-xs">items completed</p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Your Lists</h2>
          <Button asChild>
            <Link href="/lists/new">+ New List</Link>
          </Button>
        </div>
        <Card className="flex min-h-[240px] flex-col items-center justify-center border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-2 pt-6">
            <ListIcon className="text-muted-foreground size-12" />
            <p className="text-muted-foreground text-center text-sm">
              No watchlists yet. Create your first one!
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/lists/new">Create list</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
