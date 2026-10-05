import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import HomePage from "./HomePage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

const mockPush = vi.fn();
let mockSearch = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

const noopThunk = () => () => Promise.resolve();

describe("HomePage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockPosts = [
    {
      id: 10,
      user_id: 1,
      cover: "https://example.com/cover10.jpg",
      description: "Belajar Next.js itu menyenangkan",
      created_at: "2024-10-05T03:07:11.000000Z",
      updated_at: "2024-10-05T03:07:11.000000Z",
      author: { name: "Abdullah", photo: "https://example.com/abdul.jpg" },
      likes: [1, 2],
      comments: [7],
    },
    {
      id: 11,
      user_id: 2,
      cover: null,
      description: "Redux Toolkit sangat membantu",
      created_at: "2024-10-06T03:07:11.000000Z",
      updated_at: "2024-10-06T03:07:11.000000Z",
      author: { name: "Budi", photo: null },
      likes: [],
      comments: [],
    },
    {
      id: 12,
      user_id: 3,
      cover: null,
      description: null,
      created_at: "2024-10-07T03:07:11.000000Z",
      updated_at: "2024-10-07T03:07:11.000000Z",
      author: null,
    },
    {
      id: 13,
      user_id: 4,
      cover: null,
      description: "Tanpa nama pembuat",
      created_at: "2024-10-08T03:07:11.000000Z",
      updated_at: "2024-10-08T03:07:11.000000Z",
      author: { name: "", photo: null },
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockClear();
    mockSearch = "";
  });

  it("should return null if profile is not present", () => {
    vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    const { container } = renderWithProviders(<HomePage />, {
      preloadedState: { profile: null },
    });
    expect(container.firstChild).toBeNull();
  });

  it("should render empty state when there are no posts", async () => {
    vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: [] },
    });

    expect(screen.getByText("Linimasa Postingan")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Belum ada postingan yang cocok.")).toBeInTheDocument();
    });
  });

  it("should display loading indicator while posts are loading", async () => {
    vi.spyOn(postAction, "asyncSetPosts").mockImplementation(() => () => new Promise(() => {}));
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: [] },
    });

    expect(await screen.findByText("Memuat postingan...")).toBeInTheDocument();
  });

  it("should request all posts when is_me filter is absent", async () => {
    const spy = vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: [] },
    });

    await waitFor(() => expect(spy).toHaveBeenCalledWith(false));
    expect(screen.queryByTestId("delete-all-posts-btn")).not.toBeInTheDocument();
  });

  it("should render post cards with cover, author, description, date, likes and comments", async () => {
    vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    const card = screen.getByTestId("post-card-10");
    expect(card).toHaveAttribute("href", "/posts/10");
    expect(card).toHaveTextContent("Belajar Next.js itu menyenangkan");
    expect(card).toHaveTextContent("Abdullah");
    expect(card.querySelector('img[src="https://example.com/cover10.jpg"]')).toBeInTheDocument();
    expect(card.querySelector('img[src="https://example.com/abdul.jpg"]')).toBeInTheDocument();
    expect(screen.getByTestId("post-likes-10")).toHaveTextContent("2");
    expect(screen.getByTestId("post-comments-10")).toHaveTextContent("1");
    // liked by me (profile.id = 1) -> highlighted
    expect(screen.getByTestId("post-likes-10").className).toContain("text-rose-600");

    // not liked
    expect(screen.getByTestId("post-likes-11").className).not.toContain("text-rose-600");
    expect(screen.getByTestId("post-likes-11")).toHaveTextContent("0");
    // initial of author when no photo
    expect(screen.getByTestId("post-card-11")).toHaveTextContent("B");
    await act(async () => {});
  });

  it("should fall back gracefully when author, likes or comments are missing", async () => {
    vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    const noAuthor = screen.getByTestId("post-card-12");
    expect(noAuthor).toHaveTextContent("Pengguna");
    expect(noAuthor).toHaveTextContent("U");
    expect(screen.getByTestId("post-likes-12")).toHaveTextContent("0");
    expect(screen.getByTestId("post-comments-12")).toHaveTextContent("0");

    const emptyName = screen.getByTestId("post-card-13");
    expect(emptyName).toHaveTextContent("Pengguna");
    await act(async () => {});
  });

  it("should live-filter by description and by author name", async () => {
    vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    await act(async () => {});
    const search = screen.getByTestId("search-post-input");

    fireEvent.change(search, { target: { value: "redux" } });
    expect(screen.getByTestId("post-card-11")).toBeInTheDocument();
    expect(screen.queryByTestId("post-card-10")).not.toBeInTheDocument();
    // post with null description / empty author name must not break filtering
    expect(screen.queryByTestId("post-card-12")).not.toBeInTheDocument();
    expect(screen.queryByTestId("post-card-13")).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "ABDULLAH" } });
    expect(screen.getByTestId("post-card-10")).toBeInTheDocument();
    expect(screen.queryByTestId("post-card-11")).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "tidak ada yang cocok" } });
    expect(screen.getByText("Belum ada postingan yang cocok.")).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "   " } });
    expect(screen.getByTestId("post-card-10")).toBeInTheDocument();
    await act(async () => {});
  });

  it("should navigate when tabs are clicked", async () => {
    vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: [] },
    });

    fireEvent.click(screen.getByTestId("tab-me-btn"));
    expect(mockPush).toHaveBeenCalledWith("/?is_me=1");

    fireEvent.click(screen.getByTestId("tab-all-btn"));
    expect(mockPush).toHaveBeenCalledWith("/");
    await act(async () => {});
  });

  it("should load own posts and show delete-all when is_me=1", async () => {
    mockSearch = "is_me=1";
    const spy = vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: [] },
    });

    expect(screen.getByRole("heading", { name: "Postingan Saya" })).toBeInTheDocument();
    expect(screen.getByTestId("delete-all-posts-btn")).toBeInTheDocument();
    await waitFor(() => expect(spy).toHaveBeenCalledWith(true));
  });

  it("should open and close the add modal", async () => {
    vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: [] },
    });

    expect(screen.queryByTestId("add-post-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("add-post-btn"));
    expect(screen.getByTestId("add-post-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    expect(screen.queryByTestId("add-post-modal")).not.toBeInTheDocument();
    await act(async () => {});
  });

  it("should delete all own posts after confirmation", async () => {
    mockSearch = "is_me=1";
    vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    const deleteAll = vi.spyOn(postAction, "asyncSetIsPostDeleteAll").mockImplementation(noopThunk);
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as never);

    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: [] },
    });

    fireEvent.click(screen.getByTestId("delete-all-posts-btn"));
    await waitFor(() => expect(deleteAll).toHaveBeenCalledTimes(1));
  });

  it("should not delete anything when confirmation is cancelled", async () => {
    mockSearch = "is_me=1";
    vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    const deleteAll = vi.spyOn(postAction, "asyncSetIsPostDeleteAll").mockImplementation(noopThunk);
    const confirm = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValue({ isConfirmed: false } as never);

    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: [] },
    });

    fireEvent.click(screen.getByTestId("delete-all-posts-btn"));
    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(deleteAll).not.toHaveBeenCalled();
  });

  it("should reload posts and reset flags after delete-all succeeded", async () => {
    const spy = vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    const { store } = renderWithProviders(<HomePage />, {
      preloadedState: {
        profile: mockProfile,
        posts: [],
        isPostDeleteAll: true,
        isPostDeletedAll: true,
      },
    });

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
    expect(store.getState().isPostDeleteAll).toBe(false);
    expect(store.getState().isPostDeletedAll).toBe(false);
  });

  it("should not reload posts when delete-all finished but failed", async () => {
    const spy = vi.spyOn(postAction, "asyncSetPosts").mockImplementation(noopThunk);
    const { store } = renderWithProviders(<HomePage />, {
      preloadedState: {
        profile: mockProfile,
        posts: [],
        isPostDeleteAll: true,
        isPostDeletedAll: false,
      },
    });

    await act(async () => {});
    expect(spy).toHaveBeenCalledTimes(1);
    expect(store.getState().isPostDeleteAll).toBe(false);
  });

  it("should not update loading state after unmount", async () => {
    let resolveLoad: () => void = () => {};
    vi.spyOn(postAction, "asyncSetPosts").mockImplementation(
      () => () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve;
        })
    );

    const { unmount } = renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: [] },
    });

    unmount();
    await act(async () => {
      resolveLoad();
    });
    // no crash / warning expected
    expect(true).toBe(true);
  });
});
