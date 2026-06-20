/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PosterGridCard, WatchItem } from "@/components/watch-ui";

jest.mock("@/components/poster-image", () => ({
  PosterImage: () => <img data-testid="poster-image" alt="" />,
}));

function makeItem(overrides: Partial<WatchItem> = {}): WatchItem {
  return {
    id: "movie-123",
    title: "Past Lives",
    year: 2023,
    type: "pelicula",
    meta: "Película · ★ 7.8",
    rating: 7.8,
    status: "pending",
    poster: { bg: "#3a4655", ink: "#f0e6cf", accent: "#d9a05a" },
    votes: { me: null, partner: null },
    ...overrides,
  };
}

describe("PosterGridCard", () => {
  it("renders year, type and rating without duplicating the type label", () => {
    render(<PosterGridCard item={makeItem()} />);

    // The subtitle line should contain the expected format
    const subtitle = screen.getByText("2023 · Película · ★ 7.8");
    expect(subtitle).toBeInTheDocument();
  });

  it("does not show the type twice (regression)", () => {
    const item = makeItem({ type: "serie", meta: "Serie · ★ 8.1" });
    render(<PosterGridCard item={item} />);

    // "Serie" should appear in the subtitle exactly once, combined with year and rating
    const subtitle = screen.getByText("2023 · Serie · ★ 8.1");
    expect(subtitle).toBeInTheDocument();

    // The old bug would produce "Serie · Serie"; make sure that doesn't exist
    expect(screen.queryByText(/Serie · Serie/)).toBeNull();
  });

  it("renders without rating when rating is absent", () => {
    const item = makeItem({ meta: "Película", rating: 0 });
    render(<PosterGridCard item={item} />);

    const subtitle = screen.getByText("2023 · Película");
    expect(subtitle).toBeInTheDocument();
  });
});
