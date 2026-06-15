import { useMemo, useState } from "react";
import {
  filterAndSortItems,
  type ListSortKey,
  type ListTabKey,
  type WatchItem,
} from "@/components/watch-ui";

export function useListFilters(items: WatchItem[]) {
  const [tab, setTab] = useState<ListTabKey>("all");
  const [sort, setSort] = useState<ListSortKey>("title");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const pending = items.filter((item) => item.status === "pending").length;
    return { all: items.length, pending, watched: items.length - pending };
  }, [items]);

  const visibleItems = useMemo(
    () => filterAndSortItems(items, { tab, query, sort }),
    [items, tab, query, sort],
  );

  return { tab, setTab, sort, setSort, query, setQuery, counts, visibleItems };
}
