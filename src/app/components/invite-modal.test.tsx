/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { InviteModal } from "./invite-modal";

jest.mock("@/components/invite-panel", () => ({
  InvitePanel: (props: { listId: number; listName: string }) => (
    <div data-testid="invite-panel" data-list-id={props.listId}>
      {props.listName}
    </div>
  ),
}));

describe("InviteModal", () => {
  it("renders the InvitePanel inside a dialog when open", () => {
    render(
      <InviteModal
        open={true}
        onOpenChange={jest.fn()}
        canManage={true}
        listId={5}
        listName="Noches de viernes"
      />,
    );

    expect(screen.getByTestId("invite-panel")).toBeInTheDocument();
    expect(screen.getByTestId("invite-panel")).toHaveAttribute(
      "data-list-id",
      "5",
    );
    expect(screen.getByText("Noches de viernes")).toBeInTheDocument();
  });

  it("does not render content when closed", () => {
    render(
      <InviteModal
        open={false}
        onOpenChange={jest.fn()}
        canManage={true}
        listId={5}
        listName="Noches de viernes"
      />,
    );

    expect(screen.queryByTestId("invite-panel")).not.toBeInTheDocument();
  });

  it("includes a close button for accessibility", () => {
    render(
      <InviteModal
        open={true}
        onOpenChange={jest.fn()}
        canManage={true}
        listId={5}
        listName="Noches de viernes"
      />,
    );

    expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument();
  });
});
