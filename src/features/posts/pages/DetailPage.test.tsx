import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import DetailPage from "./DetailPage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/posts/5",
  useParams: () => ({ postId: "5" }),
  useSearchParams: () => new URLSearchParams(),
}));

const noopThunk = () => () => Promise.resolve();

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockPost = {
    id: 5,
    user_id: 1,
    cover: "https://example.com/cover5.jpg",
    description: "Tolak ukur kemampuan adalah usaha",
    created_at: "2024-10-05T03:07:45.000000Z",
    updated_at: "2024-10-05T03:07:45.000000Z",
    author: { name: "Abdullah", photo: "https://example.com/abdul.jpg" },
    likes: [1, 2],
    comments: [
      {
        id: 2,
        comment: "Wah keren yah!",
        created_at: "2024-10-05T03:49:59.000000Z",
        updated_at: "2024-10-05T03:49:59.000000Z",
      },
      {
        id: 3,
        comment: "Mantap",
        created_at: "2024-10-05T04:49:59.000000Z",
        updated_at: "2024-10-05T04:49:59.000000Z",
      },
    ],
    my_comment: {
      id: 2,
      comment: "Wah keren yah!",
      created_at: "2024-10-05T03:49:59.000000Z",
      updated_at: "2024-10-05T03:49:59.000000Z",
    },
  };

  function renderPage(preloadedState = {}) {
    return renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, post: mockPost, ...preloadedState },
    });
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockClear();
    vi.spyOn(postAction, "asyncSetPost").mockImplementation(noopThunk);
  });

  describe("loading & loading effects", () => {
    it("should show spinner when profile or post is missing", () => {
      const { container } = renderPage({ profile: null });
      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
      expect(screen.queryByTestId("post-description")).not.toBeInTheDocument();
    });

    it("should show spinner when post is not loaded yet", () => {
      const { container } = renderPage({ post: null });
      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("should fetch post by route param on mount", () => {
      renderPage();
      expect(postAction.asyncSetPost).toHaveBeenCalledWith("5");
    });

    it("should redirect home when load finished but post is missing", () => {
      const { store } = renderPage({ post: null, isPost: true });
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(store.getState().isPost).toBe(false);
    });

    it("should stay when load finished and post exists", () => {
      const { store } = renderPage({ isPost: true });
      expect(mockPush).not.toHaveBeenCalled();
      expect(store.getState().isPost).toBe(false);
    });
  });

  describe("post content", () => {
    it("should render cover, author, description, date and counts", () => {
      renderPage();

      expect(screen.getByTestId("post-cover-image")).toHaveAttribute(
        "src",
        "https://example.com/cover5.jpg"
      );
      expect(screen.getByTestId("post-author-name")).toHaveTextContent("Abdullah");
      expect(screen.getByTestId("post-description")).toHaveTextContent(
        "Tolak ukur kemampuan adalah usaha"
      );
      expect(screen.getByTestId("likes-count")).toHaveTextContent("2");
      expect(screen.getByTestId("comments-count")).toHaveTextContent("2");
      expect(screen.getByTestId("back-to-posts-link")).toHaveAttribute("href", "/");
      expect(document.querySelector('img[src="https://example.com/abdul.jpg"]')).toBeInTheDocument();
    });

    it("should render cover placeholder and author initial when no cover or photo", () => {
      renderPage({
        post: { ...mockPost, cover: null, author: { name: "Budi", photo: null } },
      });

      expect(screen.getByTestId("post-cover-placeholder")).toBeInTheDocument();
      expect(screen.queryByTestId("post-cover-image")).not.toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
    });

    it("should fall back to default author when author is missing or unnamed", () => {
      const { unmount } = renderPage({ post: { ...mockPost, author: null } });
      expect(screen.getByTestId("post-author-name")).toHaveTextContent("Pengguna");
      expect(screen.getByText("U")).toBeInTheDocument();
      unmount();

      renderPage({ post: { ...mockPost, author: { name: "", photo: null } } });
      expect(screen.getByTestId("post-author-name")).toHaveTextContent("Pengguna");
    });

    it("should handle missing likes, comments and my_comment", () => {
      renderPage({
        post: { ...mockPost, likes: undefined, comments: undefined, my_comment: null },
      });

      expect(screen.getByTestId("likes-count")).toHaveTextContent("0");
      expect(screen.getByTestId("comments-count")).toHaveTextContent("0");
      expect(screen.getByTestId("no-comments")).toBeInTheDocument();
    });
  });

  describe("owner actions", () => {
    it("should show owner actions only for the post owner", () => {
      const { unmount } = renderPage();
      expect(screen.getByTestId("edit-cover-btn")).toBeInTheDocument();
      expect(screen.getByTestId("edit-detail-post-btn")).toBeInTheDocument();
      expect(screen.getByTestId("delete-detail-post-btn")).toBeInTheDocument();
      unmount();

      renderPage({ post: { ...mockPost, user_id: 99 } });
      expect(screen.queryByTestId("edit-cover-btn")).not.toBeInTheDocument();
      expect(screen.queryByTestId("edit-detail-post-btn")).not.toBeInTheDocument();
      expect(screen.queryByTestId("delete-detail-post-btn")).not.toBeInTheDocument();
    });

    it("should open and close the cover and edit modals", () => {
      renderPage();

      fireEvent.click(screen.getByTestId("edit-cover-btn"));
      expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("close-cover-modal-btn"));
      expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("edit-detail-post-btn"));
      expect(screen.getByTestId("edit-post-modal")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
      expect(screen.queryByTestId("edit-post-modal")).not.toBeInTheDocument();
    });

    it("should delete the post after confirmation", async () => {
      const del = vi.spyOn(postAction, "asyncSetIsPostDelete").mockImplementation(noopThunk);
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as never);
      renderPage();

      fireEvent.click(screen.getByTestId("delete-detail-post-btn"));
      await waitFor(() => expect(del).toHaveBeenCalledWith(5));
    });

    it("should not delete the post when confirmation is cancelled", async () => {
      const del = vi.spyOn(postAction, "asyncSetIsPostDelete").mockImplementation(noopThunk);
      const confirm = vi
        .spyOn(toolsHelper, "showConfirmDialog")
        .mockResolvedValue({ isConfirmed: false } as never);
      renderPage();

      fireEvent.click(screen.getByTestId("delete-detail-post-btn"));
      await waitFor(() => expect(confirm).toHaveBeenCalled());
      expect(del).not.toHaveBeenCalled();
    });

    it("should go home after the post is deleted", () => {
      const { store } = renderPage({ isPostDelete: true, isPostDeleted: true });
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(store.getState().isPostDelete).toBe(false);
      expect(store.getState().isPostDeleted).toBe(false);
    });

    it("should stay when delete finished but failed", () => {
      const { store } = renderPage({ isPostDelete: true, isPostDeleted: false });
      expect(mockPush).not.toHaveBeenCalled();
      expect(store.getState().isPostDelete).toBe(false);
    });
  });

  describe("likes", () => {
    it("should show liked state and unlike on click", () => {
      const like = vi.spyOn(postAction, "asyncSetIsPostLike").mockImplementation(noopThunk);
      renderPage();

      expect(screen.getByText("Disukai")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("like-btn"));
      expect(like).toHaveBeenCalledWith(5, false);
    });

    it("should show not-liked state and like on click", () => {
      const like = vi.spyOn(postAction, "asyncSetIsPostLike").mockImplementation(noopThunk);
      renderPage({ post: { ...mockPost, likes: [2, 3] } });

      expect(screen.getByText("Suka")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("like-btn"));
      expect(like).toHaveBeenCalledWith(5, true);
    });

    it("should refresh the post after a successful like", () => {
      const { store } = renderPage({ isPostLike: true, isPostLiked: true });
      // mount fetch + refresh after like
      expect(postAction.asyncSetPost).toHaveBeenCalledTimes(2);
      expect(store.getState().isPostLike).toBe(false);
      expect(store.getState().isPostLiked).toBe(false);
    });

    it("should not refresh the post when like failed", () => {
      renderPage({ isPostLike: true, isPostLiked: false });
      expect(postAction.asyncSetPost).toHaveBeenCalledTimes(1);
    });
  });

  describe("comments", () => {
    it("should list comments and mark only my comment", () => {
      renderPage();

      expect(screen.getByTestId("comment-2")).toHaveTextContent("Wah keren yah!");
      expect(screen.getByTestId("comment-2")).toHaveTextContent("Komentar Anda");
      expect(screen.getByTestId("comment-3")).toHaveTextContent("Mantap");
      expect(screen.getByTestId("comment-3")).not.toHaveTextContent("Komentar Anda");
      expect(screen.getAllByTestId("delete-comment-btn")).toHaveLength(1);
    });

    it("should validate empty comments", () => {
      const errorSpy = vi
        .spyOn(toolsHelper, "showErrorDialog")
        .mockImplementation(() => Promise.resolve({} as never));
      const add = vi.spyOn(postAction, "asyncSetIsPostAddComment");
      renderPage();

      fireEvent.change(screen.getByTestId("comment-input"), { target: { value: "   " } });
      fireEvent.submit(screen.getByTestId("comment-input").closest("form")!);

      expect(errorSpy).toHaveBeenCalledWith("Komentar tidak boleh kosong");
      expect(add).not.toHaveBeenCalled();
    });

    it("should submit a trimmed comment and show sending state", () => {
      const add = vi.spyOn(postAction, "asyncSetIsPostAddComment").mockImplementation(noopThunk);
      renderPage();

      fireEvent.change(screen.getByTestId("comment-input"), { target: { value: "  Bagus!  " } });
      fireEvent.submit(screen.getByTestId("comment-input").closest("form")!);

      expect(add).toHaveBeenCalledWith(5, "Bagus!");
      expect(screen.getByText("Mengirim...")).toBeInTheDocument();
      expect(screen.getByTestId("submit-comment-btn")).toBeDisabled();
    });

    it("should refresh the post and reset flags after a comment was added", () => {
      const { store } = renderPage({ isPostAddComment: true, isPostAddedComment: true });
      expect(postAction.asyncSetPost).toHaveBeenCalledTimes(2);
      expect(store.getState().isPostAddComment).toBe(false);
      expect(store.getState().isPostAddedComment).toBe(false);
    });

    it("should not refresh the post when adding a comment failed", () => {
      renderPage({ isPostAddComment: true, isPostAddedComment: false });
      expect(postAction.asyncSetPost).toHaveBeenCalledTimes(1);
    });

    it("should delete my comment after confirmation", async () => {
      const del = vi.spyOn(postAction, "asyncSetIsPostDeleteComment").mockImplementation(noopThunk);
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as never);
      renderPage();

      fireEvent.click(screen.getByTestId("delete-comment-btn"));
      await waitFor(() => expect(del).toHaveBeenCalledWith(5));
    });

    it("should keep my comment when deletion is cancelled", async () => {
      const del = vi.spyOn(postAction, "asyncSetIsPostDeleteComment").mockImplementation(noopThunk);
      const confirm = vi
        .spyOn(toolsHelper, "showConfirmDialog")
        .mockResolvedValue({ isConfirmed: false } as never);
      renderPage();

      fireEvent.click(screen.getByTestId("delete-comment-btn"));
      await waitFor(() => expect(confirm).toHaveBeenCalled());
      expect(del).not.toHaveBeenCalled();
    });

    it("should refresh the post after a comment was deleted", () => {
      const { store } = renderPage({ isPostDeleteComment: true, isPostDeletedComment: true });
      expect(postAction.asyncSetPost).toHaveBeenCalledTimes(2);
      expect(store.getState().isPostDeleteComment).toBe(false);
      expect(store.getState().isPostDeletedComment).toBe(false);
    });

    it("should not refresh the post when deleting a comment failed", () => {
      renderPage({ isPostDeleteComment: true, isPostDeletedComment: false });
      expect(postAction.asyncSetPost).toHaveBeenCalledTimes(1);
    });
  });

  it("should settle pending effects without errors", async () => {
    renderPage();
    await act(async () => {});
  });
});
