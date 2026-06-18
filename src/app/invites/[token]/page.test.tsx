/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import JoinInvitePage from "./page";
import { joinInvite } from "@/lib/watch-api";

jest.mock("next/navigation", () => ({
  useParams: () => ({ token: "invite-token" }),
}));

jest.mock("@/lib/watch-api", () => ({
  joinInvite: jest.fn(),
}));

describe("JoinInvitePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("joins an invite and links to the list", async () => {
    (joinInvite as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        alreadyMember: false,
        watchListId: 12,
        message: "Te uniste a la lista",
      },
      status: 201,
    });

    render(<JoinInvitePage />);

    expect(screen.getByText("Procesando invitación...")).toBeInTheDocument();
    expect(await screen.findByText("Te uniste a la lista")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver lista" })).toHaveAttribute(
      "href",
      "/lists?list=12",
    );
  });

  it("shows the API error when the invite cannot be used", async () => {
    (joinInvite as jest.Mock).mockResolvedValue({
      data: null,
      status: 403,
      error: "Esta invitación expiró",
    });

    render(<JoinInvitePage />);

    expect(await screen.findByText("Esta invitación expiró")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ver lista" })).not.toBeInTheDocument();
  });

  it("shows the already-member message and still links to the list", async () => {
    (joinInvite as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        alreadyMember: true,
        watchListId: 12,
        message: "Ya eres parte de esta lista",
      },
      status: 201,
    });

    render(<JoinInvitePage />);

    expect(await screen.findByText("Ya eres parte de esta lista")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver lista" })).toHaveAttribute(
      "href",
      "/lists?list=12",
    );
  });
});
