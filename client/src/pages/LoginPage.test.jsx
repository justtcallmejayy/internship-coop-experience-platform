import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import LoginPage from "./LoginPage";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
  });

  test("renders login form", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", {
        name: /internship & co-op experience sharing platform/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  test("submits login credentials and navigates to dashboard", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      user_id: 1,
      full_name: "Student One",
      email: "student1@test.com",
      role: "Student",
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "student1@test.com");
    await user.type(screen.getByLabelText(/password/i), "P@ssw0rd123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: "student1@test.com",
      password: "P@ssw0rd123",
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("shows an error when login fails", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(
      new Error("Email or password is incorrect."),
    );

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "student1@test.com");
    await user.type(screen.getByLabelText(/password/i), "WrongPass1@");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(
      await screen.findByText("Email or password is incorrect."),
    ).toBeInTheDocument();
  });
});
