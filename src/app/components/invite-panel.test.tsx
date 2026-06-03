/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { InvitePanel } from "./invite-panel";
import { createInvite, getInvites, revokeInvite } from "@/lib/watch-api";

jest.mock("@/lib/watch-api", () => ({
  createInvite: jest.fn(),
  getInvites: jest.fn(),
  revokeInvite: jest.fn(),
}));

describe("InvitePanel", () => {
  let originalClipboardDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      "clipboard",
    );
    jest.clearAllMocks();
    (getInvites as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 9,
          watchListId: 5,
          token: "existing-token",
          expiresAt: "2026-06-09T00:00:00.000Z",
          revokedAt: null,
          usedAt: null,
          createdAt: "2026-06-02T00:00:00.000Z",
          status: "active",
        },
      ],
      status: 200,
    });
  });

  afterEach(() => {
    if (originalClipboardDescriptor) {
      Object.defineProperty(navigator, "clipboard", originalClipboardDescriptor);
      return;
    }

    Reflect.deleteProperty(navigator as object, "clipboard");
  });

  it("loads active invites and exposes copy/email actions", async () => {
    render(<InvitePanel canManage listId={5} listName="Noches de viernes" />);

    expect(await screen.findByText("Activa")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copiar/i })).toBeInTheDocument();
  });

  it("creates a new invite and falls back to showing the link when clipboard is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    (createInvite as jest.Mock).mockResolvedValue({
      data: {
        id: 20,
        watchListId: 5,
        token: "invite-token",
        expiresAt: "2026-06-09T00:00:00.000Z",
        revokedAt: null,
        usedAt: null,
        createdAt: "2026-06-02T00:00:00.000Z",
        status: "active",
      },
      status: 201,
    });

    render(<InvitePanel canManage listId={5} listName="Noches de viernes" />);

    await screen.findByText("Activa");
    fireEvent.click(screen.getByRole("button", { name: /crear invitación/i }));

    expect(
      await screen.findByText("Invitación lista. Copia el enlace para compartirlo."),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /invite-token/i }).length).toBeGreaterThan(0);
  });

  it("revokes an active invite", async () => {
    (revokeInvite as jest.Mock).mockResolvedValue({
      data: {
        id: 9,
        watchListId: 5,
        token: "existing-token",
        expiresAt: "2026-06-09T00:00:00.000Z",
        revokedAt: "2026-06-03T00:00:00.000Z",
        usedAt: null,
        createdAt: "2026-06-02T00:00:00.000Z",
        status: "revoked",
      },
      status: 200,
    });

    render(<InvitePanel canManage listId={5} listName="Noches de viernes" />);

    await screen.findByText("Activa");
    fireEvent.click(screen.getByRole("button", { name: /revocar/i }));

    await waitFor(() => expect(revokeInvite).toHaveBeenCalledWith(5, 9));
    expect(await screen.findByText("Invitación revocada.")).toBeInTheDocument();
    expect(screen.getByText("Revocada")).toBeInTheDocument();
  });
});
