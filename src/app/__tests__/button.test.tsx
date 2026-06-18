/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Button } from "../components/ui/button";

describe("Button", () => {
  it("defaults to type button", () => {
    render(<Button>Accion</Button>);

    expect(screen.getByRole("button", { name: "Accion" })).toHaveAttribute(
      "type",
      "button",
    );
  });
});
