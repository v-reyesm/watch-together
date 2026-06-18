/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { AddToListButton } from "../components/add-to-list-button";
import type { ApiWatchList } from "../lib/watch-api";

// Radix DropdownMenu relies on a couple of DOM APIs that jsdom lacks.
beforeAll(() => {
  Element.prototype.hasPointerCapture = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
});

function makeList(id: number, name: string): ApiWatchList {
  return {
    id,
    name,
    description: "",
    members: [],
    itemCount: 0,
    pendingCount: 0,
    watchedCount: 0,
    items: [],
  };
}

const lists = [makeList(1, "Con la baby"), makeList(2, "Pendientes")];

describe("AddToListButton", () => {
  it("adds to the default list from the primary segment", async () => {
    const onAdd = jest.fn();
    render(
      <AddToListButton
        lists={lists}
        defaultListId={1}
        isAdded={() => false}
        onAdd={onAdd}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Agregar a Con la baby/i }),
    );

    expect(onAdd).toHaveBeenCalledWith(1);
  });

  it("adds to the list chosen from the picker", async () => {
    const onAdd = jest.fn();
    render(
      <AddToListButton
        lists={lists}
        defaultListId={1}
        isAdded={() => false}
        onAdd={onAdd}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Elegir otra lista" }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Pendientes" }),
    );

    expect(onAdd).toHaveBeenCalledWith(2);
  });

  it("renders a plain button with a single list and no picker", () => {
    render(
      <AddToListButton
        lists={[makeList(7, "Sola")]}
        defaultListId={7}
        isAdded={() => false}
        onAdd={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Agregar a Sola/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Elegir otra lista" }),
    ).not.toBeInTheDocument();
  });

  it("defers to caller guidance when there are no lists", async () => {
    const onAdd = jest.fn();
    render(
      <AddToListButton
        lists={[]}
        defaultListId={null}
        isAdded={() => false}
        onAdd={onAdd}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Agregar a lista/i }),
    );

    expect(onAdd).toHaveBeenCalledWith(null);
  });
});
