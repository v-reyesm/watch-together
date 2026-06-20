/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog", () => {
  it("renders the title and buttons when open", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={jest.fn()}
        title='¿Quitar "Past Lives" de esta lista?'
        onConfirm={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /Past Lives/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("does not render content when closed", () => {
    render(
      <ConfirmDialog
        open={false}
        onOpenChange={jest.fn()}
        title="Test title"
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.queryByRole("heading", { name: "Test title" })).not.toBeInTheDocument();
  });

  it("calls onConfirm and closes when the confirm button is clicked", () => {
    const onConfirm = jest.fn();
    const onOpenChange = jest.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Remove item?"
        confirmLabel="Remove"
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("uses custom labels when provided", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={jest.fn()}
        title="Confirm action"
        confirmLabel="Quitar"
        cancelLabel="No, volver"
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Quitar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No, volver" })).toBeInTheDocument();
  });

  it("renders an optional description", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={jest.fn()}
        title="Confirm"
        description="This action cannot be undone."
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });
});
