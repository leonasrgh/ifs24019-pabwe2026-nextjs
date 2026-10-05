import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  setPostsActionCreator,
  asyncSetPosts,
  setPostActionCreator,
  setIsPostActionCreator,
  asyncSetPost,
  setIsPostAddActionCreator,
  setIsPostAddedActionCreator,
  setIsPostChangeActionCreator,
  setIsPostChangedActionCreator,
  setIsPostChangeCoverActionCreator,
  setIsPostChangedCoverActionCreator,
  setIsPostDeleteActionCreator,
  setIsPostDeletedActionCreator,
  setIsPostLikeActionCreator,
  setIsPostLikedActionCreator,
  setIsPostAddCommentActionCreator,
  setIsPostAddedCommentActionCreator,
  setIsPostDeleteCommentActionCreator,
  setIsPostDeletedCommentActionCreator,
  setIsPostDeleteAllActionCreator,
  setIsPostDeletedAllActionCreator,
  asyncSetIsPostAdd,
  asyncSetIsPostChange,
  asyncSetIsPostChangeCover,
  asyncSetIsPostDelete,
  asyncSetIsPostLike,
  asyncSetIsPostAddComment,
  asyncSetIsPostDeleteComment,
  asyncSetIsPostDeleteAll,
} from "./action";
import postApi from "../api/postApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("posts action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("action creators", () => {
    it("should create posts, post and isPost actions", () => {
      expect(setPostsActionCreator([{ id: 1 }])).toEqual({
        type: ActionType.SET_POSTS,
        payload: [{ id: 1 }],
      });
      expect(setPostActionCreator({ id: 1 })).toEqual({
        type: ActionType.SET_POST,
        payload: { id: 1 },
      });
      expect(setIsPostActionCreator(true)).toEqual({
        type: ActionType.SET_IS_POST,
        payload: true,
      });
    });

    it.each([
    ["Add", setIsPostAddActionCreator, ActionType.SET_IS_POST_ADD],
    ["Added", setIsPostAddedActionCreator, ActionType.SET_IS_POST_ADDED],
    ["Change", setIsPostChangeActionCreator, ActionType.SET_IS_POST_CHANGE],
    ["Changed", setIsPostChangedActionCreator, ActionType.SET_IS_POST_CHANGED],
    ["ChangeCover", setIsPostChangeCoverActionCreator, ActionType.SET_IS_POST_CHANGE_COVER],
    ["ChangedCover", setIsPostChangedCoverActionCreator, ActionType.SET_IS_POST_CHANGED_COVER],
    ["Delete", setIsPostDeleteActionCreator, ActionType.SET_IS_POST_DELETE],
    ["Deleted", setIsPostDeletedActionCreator, ActionType.SET_IS_POST_DELETED],
    ["Like", setIsPostLikeActionCreator, ActionType.SET_IS_POST_LIKE],
    ["Liked", setIsPostLikedActionCreator, ActionType.SET_IS_POST_LIKED],
    ["AddComment", setIsPostAddCommentActionCreator, ActionType.SET_IS_POST_ADD_COMMENT],
    ["AddedComment", setIsPostAddedCommentActionCreator, ActionType.SET_IS_POST_ADDED_COMMENT],
    ["DeleteComment", setIsPostDeleteCommentActionCreator, ActionType.SET_IS_POST_DELETE_COMMENT],
    ["DeletedComment", setIsPostDeletedCommentActionCreator, ActionType.SET_IS_POST_DELETED_COMMENT],
    ["DeleteAll", setIsPostDeleteAllActionCreator, ActionType.SET_IS_POST_DELETE_ALL],
    ["DeletedAll", setIsPostDeletedAllActionCreator, ActionType.SET_IS_POST_DELETED_ALL],
    ])("should create %s action", (_name, creator, type) => {
      expect(creator(true)).toEqual({ type, payload: true });
      expect(creator(false)).toEqual({ type, payload: false });
    });
  });

  describe("asyncSetPosts", () => {
    it("should dispatch posts for all posts by default", async () => {
      const spy = vi.spyOn(postApi, "getPosts").mockResolvedValue([{ id: 1 }]);
      const dispatch = vi.fn();

      await asyncSetPosts()(dispatch);

      expect(spy).toHaveBeenCalledWith(false);
      expect(dispatch).toHaveBeenCalledWith(setPostsActionCreator([{ id: 1 }]));
    });

    it("should request own posts when isMe is true", async () => {
      const spy = vi.spyOn(postApi, "getPosts").mockResolvedValue([]);
      const dispatch = vi.fn();

      await asyncSetPosts(true)(dispatch);

      expect(spy).toHaveBeenCalledWith(true);
    });

    it("should dispatch empty array when request fails", async () => {
      vi.spyOn(postApi, "getPosts").mockRejectedValue(new Error("fail"));
      const dispatch = vi.fn();

      await asyncSetPosts()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setPostsActionCreator([]));
    });
  });

  describe("asyncSetPost", () => {
    it("should dispatch post and isPost flag on success", async () => {
      vi.spyOn(postApi, "getPostById").mockResolvedValue({ id: 7 });
      const dispatch = vi.fn();

      await asyncSetPost(7)(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, setPostActionCreator({ id: 7 }));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsPostActionCreator(true));
    });

    it("should dispatch null post and isPost flag on failure", async () => {
      vi.spyOn(postApi, "getPostById").mockRejectedValue(new Error("fail"));
      const dispatch = vi.fn();

      await asyncSetPost(7)(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, setPostActionCreator(null));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsPostActionCreator(true));
    });
  });

  describe("asyncSetIsPostAdd", () => {
    it("should show success dialog and flag added on success", async () => {
      vi.spyOn(postApi, "postPost").mockResolvedValue({ post_id: 1 });
      const success = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => Promise.resolve({} as never));
      const dispatch = vi.fn();

      await asyncSetIsPostAdd("Deskripsi")(dispatch);

      expect(success).toHaveBeenCalledWith("Postingan berhasil ditambahkan!");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsPostAddedActionCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsPostAddActionCreator(true));
    });

    it("should show error dialog and flag not added on failure", async () => {
      vi.spyOn(postApi, "postPost").mockRejectedValue(new Error("Data tidak valid"));
      const error = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({} as never));
      const dispatch = vi.fn();

      await asyncSetIsPostAdd("")(dispatch);

      expect(error).toHaveBeenCalledWith("Data tidak valid");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsPostAddedActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsPostAddActionCreator(true));
    });
  });

  describe.each([
    ["asyncSetIsPostChange", asyncSetIsPostChange, "putPost", [1, "Baru"], "Postingan berhasil diperbarui!", setIsPostChangedActionCreator, setIsPostChangeActionCreator],
    ["asyncSetIsPostChangeCover", asyncSetIsPostChangeCover, "postPostCover", [1, new File(["x"], "c.jpg")], "Cover berhasil diperbarui!", setIsPostChangedCoverActionCreator, setIsPostChangeCoverActionCreator],
    ["asyncSetIsPostDelete", asyncSetIsPostDelete, "deletePost", [1], "Postingan berhasil dihapus!", setIsPostDeletedActionCreator, setIsPostDeleteActionCreator],
    ["asyncSetIsPostAddComment", asyncSetIsPostAddComment, "postPostComment", [1, "Keren"], "Komentar berhasil ditambahkan!", setIsPostAddedCommentActionCreator, setIsPostAddCommentActionCreator],
    ["asyncSetIsPostDeleteComment", asyncSetIsPostDeleteComment, "deletePostComment", [1], "Komentar berhasil dihapus!", setIsPostDeletedCommentActionCreator, setIsPostDeleteCommentActionCreator],
    ["asyncSetIsPostDeleteAll", asyncSetIsPostDeleteAll, "deleteAllPosts", [], "Semua postingan berhasil dihapus!", setIsPostDeletedAllActionCreator, setIsPostDeleteAllActionCreator],
  ])("%s", (_name, thunk, apiFn, args, defaultMessage, doneCreator, finishCreator) => {
    it("should show API message and flag done on success", async () => {
      vi.spyOn(postApi, apiFn as never).mockResolvedValue("Pesan dari API" as never);
      const success = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => Promise.resolve({} as never));
      const dispatch = vi.fn();

      await (thunk as (...a: unknown[]) => (d: unknown) => Promise<void>)(...args)(dispatch);

      expect(success).toHaveBeenCalledWith("Pesan dari API");
      expect(dispatch).toHaveBeenNthCalledWith(1, doneCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(2, finishCreator(true));
    });

    it("should use default message when API message is empty", async () => {
      vi.spyOn(postApi, apiFn as never).mockResolvedValue(undefined as never);
      const success = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => Promise.resolve({} as never));
      const dispatch = vi.fn();

      await (thunk as (...a: unknown[]) => (d: unknown) => Promise<void>)(...args)(dispatch);

      expect(success).toHaveBeenCalledWith(defaultMessage);
    });

    it("should show error dialog and flag failure when request fails", async () => {
      vi.spyOn(postApi, apiFn as never).mockRejectedValue(new Error("Gagal") as never);
      const error = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({} as never));
      const dispatch = vi.fn();

      await (thunk as (...a: unknown[]) => (d: unknown) => Promise<void>)(...args)(dispatch);

      expect(error).toHaveBeenCalledWith("Gagal");
      expect(dispatch).toHaveBeenNthCalledWith(1, doneCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, finishCreator(true));
    });
  });

  describe("asyncSetIsPostLike", () => {
    it("should flag liked on success without success dialog", async () => {
      const spy = vi.spyOn(postApi, "postPostLike").mockResolvedValue("ok");
      const success = vi.spyOn(toolsHelper, "showSuccessDialog");
      const dispatch = vi.fn();

      await asyncSetIsPostLike(1, true)(dispatch);

      expect(spy).toHaveBeenCalledWith(1, true);
      expect(success).not.toHaveBeenCalled();
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsPostLikedActionCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsPostLikeActionCreator(true));
    });

    it("should show error dialog and flag failure when request fails", async () => {
      vi.spyOn(postApi, "postPostLike").mockRejectedValue(new Error("Gagal suka"));
      const error = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({} as never));
      const dispatch = vi.fn();

      await asyncSetIsPostLike(1, false)(dispatch);

      expect(error).toHaveBeenCalledWith("Gagal suka");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsPostLikedActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsPostLikeActionCreator(true));
    });
  });
});
