import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import SidebarComponent from "./SidebarComponent";
import { renderWithProviders } from "../../../test-utils";

let mockPathname = "/";
let mockSearch = "";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

function activeLabels() {
  return screen
    .getAllByRole("link")
    .filter((link) => link.className.includes("bg-indigo-600"))
    .map((link) => link.textContent);
}

describe("SidebarComponent", () => {
  beforeEach(() => {
    mockPathname = "/";
    mockSearch = "";
  });

  it("should render all main navigation items with correct hrefs", () => {
    renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);

    expect(screen.getByText("Semua Postingan").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("Postingan Saya").closest("a")).toHaveAttribute("href", "/?is_me=1");
    expect(screen.getByText("Daftar Pengguna").closest("a")).toHaveAttribute("href", "/users");
    expect(screen.getByText("Profil Saya").closest("a")).toHaveAttribute("href", "/profile");
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("should mark 'Semua Postingan' active on home without is_me", () => {
    renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);
    expect(activeLabels()).toEqual(["Semua Postingan"]);
  });

  it("should mark 'Postingan Saya' active on home with is_me=1", () => {
    mockSearch = "is_me=1";
    renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);
    expect(activeLabels()).toEqual(["Postingan Saya"]);
  });

  it("should mark 'Semua Postingan' active on post detail page", () => {
    mockPathname = "/posts/12";
    renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);
    expect(activeLabels()).toEqual(["Semua Postingan"]);
  });

  it.each([
    ["/users", "Daftar Pengguna"],
    ["/users/3", "Daftar Pengguna"],
    ["/profile", "Profil Saya"],
    ["/profile/edit", "Profil Saya"],
  ])("should mark the right item active for %s", (path, label) => {
    mockPathname = path;
    renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);
    expect(activeLabels()).toEqual([label]);
  });

  it("should show backdrop on mobile and close on click / link click", () => {
    const onCloseMobile = vi.fn();
    renderWithProviders(<SidebarComponent isSidebarOpen={true} onCloseMobile={onCloseMobile} />);

    fireEvent.click(screen.getByTestId("sidebar-backdrop"));
    expect(onCloseMobile).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Profil Saya"));
    expect(onCloseMobile).toHaveBeenCalledTimes(2);
  });
});
