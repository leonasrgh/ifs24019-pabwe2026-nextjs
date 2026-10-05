import { describe, it, expect } from "vitest";
import {
  postsReducer,
  postReducer,
  isPostReducer,
  isPostAddReducer,
  isPostAddedReducer,
  isPostChangeReducer,
  isPostChangedReducer,
  isPostChangeCoverReducer,
  isPostChangedCoverReducer,
  isPostDeleteReducer,
  isPostDeletedReducer,
  isPostLikeReducer,
  isPostLikedReducer,
  isPostAddCommentReducer,
  isPostAddedCommentReducer,
  isPostDeleteCommentReducer,
  isPostDeletedCommentReducer,
  isPostDeleteAllReducer,
  isPostDeletedAllReducer,
} from "./reducer";
import { ActionType } from "./action";

describe("posts reducers", () => {
  it.each([
    ["postsReducer", postsReducer, [], ActionType.SET_POSTS, [{ id: 1 }]],
    ["postReducer", postReducer, null, ActionType.SET_POST, { id: 1 }],
    ["isPostReducer", isPostReducer, false, ActionType.SET_IS_POST, true],
    ["isPostAddReducer", isPostAddReducer, false, ActionType.SET_IS_POST_ADD, true],
    ["isPostAddedReducer", isPostAddedReducer, false, ActionType.SET_IS_POST_ADDED, true],
    ["isPostChangeReducer", isPostChangeReducer, false, ActionType.SET_IS_POST_CHANGE, true],
    ["isPostChangedReducer", isPostChangedReducer, false, ActionType.SET_IS_POST_CHANGED, true],
    ["isPostChangeCoverReducer", isPostChangeCoverReducer, false, ActionType.SET_IS_POST_CHANGE_COVER, true],
    ["isPostChangedCoverReducer", isPostChangedCoverReducer, false, ActionType.SET_IS_POST_CHANGED_COVER, true],
    ["isPostDeleteReducer", isPostDeleteReducer, false, ActionType.SET_IS_POST_DELETE, true],
    ["isPostDeletedReducer", isPostDeletedReducer, false, ActionType.SET_IS_POST_DELETED, true],
    ["isPostLikeReducer", isPostLikeReducer, false, ActionType.SET_IS_POST_LIKE, true],
    ["isPostLikedReducer", isPostLikedReducer, false, ActionType.SET_IS_POST_LIKED, true],
    ["isPostAddCommentReducer", isPostAddCommentReducer, false, ActionType.SET_IS_POST_ADD_COMMENT, true],
    ["isPostAddedCommentReducer", isPostAddedCommentReducer, false, ActionType.SET_IS_POST_ADDED_COMMENT, true],
    ["isPostDeleteCommentReducer", isPostDeleteCommentReducer, false, ActionType.SET_IS_POST_DELETE_COMMENT, true],
    ["isPostDeletedCommentReducer", isPostDeletedCommentReducer, false, ActionType.SET_IS_POST_DELETED_COMMENT, true],
    ["isPostDeleteAllReducer", isPostDeleteAllReducer, false, ActionType.SET_IS_POST_DELETE_ALL, true],
    ["isPostDeletedAllReducer", isPostDeletedAllReducer, false, ActionType.SET_IS_POST_DELETED_ALL, true],
  ])("%s should return default state, handle its action and ignore others", (_name, reducer, initial, type, payload) => {
    expect(reducer(undefined, {})).toEqual(initial);
    expect(reducer(undefined, { type: "UNKNOWN" })).toEqual(initial);
    expect(reducer(initial, { type, payload })).toEqual(payload);
  });
});
