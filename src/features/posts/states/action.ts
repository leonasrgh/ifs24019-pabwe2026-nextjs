import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import postApi from "../api/postApi";

export const ActionType = {
  SET_POSTS: "SET_POSTS",
  SET_POST: "SET_POST",
  SET_IS_POST: "SET_IS_POST",
  SET_IS_POST_ADD: "SET_IS_POST_ADD",
  SET_IS_POST_ADDED: "SET_IS_POST_ADDED",
  SET_IS_POST_CHANGE: "SET_IS_POST_CHANGE",
  SET_IS_POST_CHANGED: "SET_IS_POST_CHANGED",
  SET_IS_POST_CHANGE_COVER: "SET_IS_POST_CHANGE_COVER",
  SET_IS_POST_CHANGED_COVER: "SET_IS_POST_CHANGED_COVER",
  SET_IS_POST_DELETE: "SET_IS_POST_DELETE",
  SET_IS_POST_DELETED: "SET_IS_POST_DELETED",
  SET_IS_POST_LIKE: "SET_IS_POST_LIKE",
  SET_IS_POST_LIKED: "SET_IS_POST_LIKED",
  SET_IS_POST_ADD_COMMENT: "SET_IS_POST_ADD_COMMENT",
  SET_IS_POST_ADDED_COMMENT: "SET_IS_POST_ADDED_COMMENT",
  SET_IS_POST_DELETE_COMMENT: "SET_IS_POST_DELETE_COMMENT",
  SET_IS_POST_DELETED_COMMENT: "SET_IS_POST_DELETED_COMMENT",
  SET_IS_POST_DELETE_ALL: "SET_IS_POST_DELETE_ALL",
  SET_IS_POST_DELETED_ALL: "SET_IS_POST_DELETED_ALL",
};

export function setPostsActionCreator(posts) {
  return {
    type: ActionType.SET_POSTS,
    payload: posts,
  };
}

export function asyncSetPosts(isMe = false) {
  return async (dispatch) => {
    try {
      const posts = await postApi.getPosts(isMe);
      dispatch(setPostsActionCreator(posts));
    } catch (error) {
      dispatch(setPostsActionCreator([]));
    }
  };
}

export function setPostActionCreator(post) {
  return {
    type: ActionType.SET_POST,
    payload: post,
  };
}

export function setIsPostActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST,
    payload: status,
  };
}

export function asyncSetPost(postId) {
  return async (dispatch) => {
    try {
      const post = await postApi.getPostById(postId);
      dispatch(setPostActionCreator(post));
    } catch (error) {
      dispatch(setPostActionCreator(null));
    } finally {
      dispatch(setIsPostActionCreator(true));
    }
  };
}

export function setIsPostAddActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_ADD,
    payload: status,
  };
}

export function setIsPostAddedActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_ADDED,
    payload: status,
  };
}

export function setIsPostChangeActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_CHANGE,
    payload: status,
  };
}

export function setIsPostChangedActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_CHANGED,
    payload: status,
  };
}

export function setIsPostChangeCoverActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_CHANGE_COVER,
    payload: status,
  };
}

export function setIsPostChangedCoverActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_CHANGED_COVER,
    payload: status,
  };
}

export function setIsPostDeleteActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_DELETE,
    payload: status,
  };
}

export function setIsPostDeletedActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_DELETED,
    payload: status,
  };
}

export function setIsPostLikeActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_LIKE,
    payload: status,
  };
}

export function setIsPostLikedActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_LIKED,
    payload: status,
  };
}

export function setIsPostAddCommentActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_ADD_COMMENT,
    payload: status,
  };
}

export function setIsPostAddedCommentActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_ADDED_COMMENT,
    payload: status,
  };
}

export function setIsPostDeleteCommentActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_DELETE_COMMENT,
    payload: status,
  };
}

export function setIsPostDeletedCommentActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_DELETED_COMMENT,
    payload: status,
  };
}

export function setIsPostDeleteAllActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_DELETE_ALL,
    payload: status,
  };
}

export function setIsPostDeletedAllActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_DELETED_ALL,
    payload: status,
  };
}

export function asyncSetIsPostAdd(description) {
  return async (dispatch) => {
    try {
      await postApi.postPost(description);
      showSuccessDialog("Postingan berhasil ditambahkan!");
      dispatch(setIsPostAddedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostAddedActionCreator(false));
    } finally {
      dispatch(setIsPostAddActionCreator(true));
    }
  };
}

export function asyncSetIsPostChange(postId, description) {
  return async (dispatch) => {
    try {
      const message = await postApi.putPost(postId, description);
      showSuccessDialog(message || "Postingan berhasil diperbarui!");
      dispatch(setIsPostChangedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostChangedActionCreator(false));
    } finally {
      dispatch(setIsPostChangeActionCreator(true));
    }
  };
}

export function asyncSetIsPostChangeCover(postId, cover) {
  return async (dispatch) => {
    try {
      const message = await postApi.postPostCover(postId, cover);
      showSuccessDialog(message || "Cover berhasil diperbarui!");
      dispatch(setIsPostChangedCoverActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostChangedCoverActionCreator(false));
    } finally {
      dispatch(setIsPostChangeCoverActionCreator(true));
    }
  };
}

export function asyncSetIsPostDelete(postId) {
  return async (dispatch) => {
    try {
      const message = await postApi.deletePost(postId);
      showSuccessDialog(message || "Postingan berhasil dihapus!");
      dispatch(setIsPostDeletedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostDeletedActionCreator(false));
    } finally {
      dispatch(setIsPostDeleteActionCreator(true));
    }
  };
}

export function asyncSetIsPostLike(postId, like) {
  return async (dispatch) => {
    try {
      await postApi.postPostLike(postId, like);
      dispatch(setIsPostLikedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostLikedActionCreator(false));
    } finally {
      dispatch(setIsPostLikeActionCreator(true));
    }
  };
}

export function asyncSetIsPostAddComment(postId, comment) {
  return async (dispatch) => {
    try {
      const message = await postApi.postPostComment(postId, comment);
      showSuccessDialog(message || "Komentar berhasil ditambahkan!");
      dispatch(setIsPostAddedCommentActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostAddedCommentActionCreator(false));
    } finally {
      dispatch(setIsPostAddCommentActionCreator(true));
    }
  };
}

export function asyncSetIsPostDeleteComment(postId) {
  return async (dispatch) => {
    try {
      const message = await postApi.deletePostComment(postId);
      showSuccessDialog(message || "Komentar berhasil dihapus!");
      dispatch(setIsPostDeletedCommentActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostDeletedCommentActionCreator(false));
    } finally {
      dispatch(setIsPostDeleteCommentActionCreator(true));
    }
  };
}

export function asyncSetIsPostDeleteAll() {
  return async (dispatch) => {
    try {
      const message = await postApi.deleteAllPosts();
      showSuccessDialog(message || "Semua postingan berhasil dihapus!");
      dispatch(setIsPostDeletedAllActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostDeletedAllActionCreator(false));
    } finally {
      dispatch(setIsPostDeleteAllActionCreator(true));
    }
  };
}
