import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListIcon } from "lucide-react";

export default function ListsPage() {
  return (
    <div className="container flex flex-col gap-8 py-6 md:py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            My Lists
          </h1>
          <p className="text-muted-foreground">Manage your watchlists</p>
        </div>
        <Button asChild>
          <Link href="/lists/new">+ New List</Link>
        </Button>
      </div>

      <Card className="flex min-h-[280px] flex-col items-center justify-center border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-2 pt-6">
          <ListIcon className="text-muted-foreground size-12" />
          <p className="text-muted-foreground text-center text-sm">
            No lists yet. Create your first one!
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/lists/new">Create list</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
