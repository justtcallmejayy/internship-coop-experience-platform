import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import RegisterPage from "./RegisterPage";
import { MemoryRouter } from "react-router";

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("RegisterPage", () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockNavigate.mockReset();
  });

  test("shows registration errors inline instead of an alert", async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce(
      new Error("An account with this email already exists."),
    );

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/full name/i), "Student One");
    await user.type(screen.getByLabelText(/email/i), "student1@test.com");
    await user.type(screen.getByLabelText(/password/i), "P@ssw0rd123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "An account with this email already exists.",
    );
  });
});
