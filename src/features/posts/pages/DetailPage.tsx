"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useInput from "../../../hooks/useInput";
import {
  asyncSetPost,
  asyncSetIsPostDelete,
  asyncSetIsPostLike,
  asyncSetIsPostAddComment,
  asyncSetIsPostDeleteComment,
  setIsPostActionCreator,
  setIsPostDeleteActionCreator,
  setIsPostDeletedActionCreator,
  setIsPostLikeActionCreator,
  setIsPostLikedActionCreator,
  setIsPostAddCommentActionCreator,
  setIsPostAddedCommentActionCreator,
  setIsPostDeleteCommentActionCreator,
  setIsPostDeletedCommentActionCreator,
} from "../states/action";
import {
  formatDate,
  showConfirmDialog,
  showErrorDialog,
} from "../../../helpers/toolsHelper";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import ChangeModal from "../modals/ChangeModal";
import {
  IconArrowLeft,
  IconPhotoUp,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconSend,
  IconPhotoOff,
  IconLoader2,
} from "@tabler/icons-react";

function DetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const profile = useAppSelector((state) => state.profile);
  const post = useAppSelector((state) => state.post);
  const isPost = useAppSelector((state) => state.isPost);
  const isPostDelete = useAppSelector((state) => state.isPostDelete);
  const isPostDeleted = useAppSelector((state) => state.isPostDeleted);
  const isPostLike = useAppSelector((state) => state.isPostLike);
  const isPostLiked = useAppSelector((state) => state.isPostLiked);
  const isPostAddComment = useAppSelector((state) => state.isPostAddComment);
  const isPostAddedComment = useAppSelector((state) => state.isPostAddedComment);
  const isPostDeleteComment = useAppSelector((state) => state.isPostDeleteComment);
  const isPostDeletedComment = useAppSelector((state) => state.isPostDeletedComment);

  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [comment, changeComment, setComment] = useInput("");

  useEffect(() => {
    dispatch(asyncSetPost(postId));
  }, [postId, dispatch]);

  useEffect(() => {
    if (isPost) {
      dispatch(setIsPostActionCreator(false));
      if (!post) {
        router.push("/");
      }
    }
  }, [isPost, post, router, dispatch]);

  useEffect(() => {
    if (isPostDelete) {
      dispatch(setIsPostDeleteActionCreator(false));
      if (isPostDeleted) {
        dispatch(setIsPostDeletedActionCreator(false));
        router.push("/");
      }
    }
  }, [isPostDelete, isPostDeleted, router, dispatch]);

  useEffect(() => {
    if (isPostLike) {
      dispatch(setIsPostLikeActionCreator(false));
      if (isPostLiked) {
        dispatch(setIsPostLikedActionCreator(false));
        dispatch(asyncSetPost(postId));
      }
    }
  }, [isPostLike, isPostLiked, postId, dispatch]);

  useEffect(() => {
    if (isPostAddComment) {
      dispatch(setIsPostAddCommentActionCreator(false));
      setSendingComment(false);
      if (isPostAddedComment) {
        dispatch(setIsPostAddedCommentActionCreator(false));
        setComment("");
        dispatch(asyncSetPost(postId));
      }
    }
  }, [isPostAddComment, isPostAddedComment, postId, dispatch, setComment]);

  useEffect(() => {
    if (isPostDeleteComment) {
      dispatch(setIsPostDeleteCommentActionCreator(false));
      if (isPostDeletedComment) {
        dispatch(setIsPostDeletedCommentActionCreator(false));
        dispatch(asyncSetPost(postId));
      }
    }
  }, [isPostDeleteComment, isPostDeletedComment, postId, dispatch]);

  if (!profile || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="sr-only">Memuat detail postingan...</h1>
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOwner = post.user_id === profile.id;
  const likes = post.likes || [];
  const liked = likes.includes(profile.id);
  const comments = post.comments || [];
  const myCommentId = post.my_comment ? post.my_comment.id : null;

  async function handleDelete() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus postingan ini?");
    if (result.isConfirmed) {
      dispatch(asyncSetIsPostDelete(post.id));
    }
  }

  function handleToggleLike() {
    dispatch(asyncSetIsPostLike(post.id, !liked));
  }

  function handleSubmitComment(e) {
    e.preventDefault();
    if (!comment.trim()) {
      showErrorDialog("Komentar tidak boleh kosong");
      return;
    }
    setSendingComment(true);
    dispatch(asyncSetIsPostAddComment(post.id, comment.trim()));
  }

  async function handleDeleteComment() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus komentar Anda?");
    if (result.isConfirmed) {
      dispatch(asyncSetIsPostDeleteComment(post.id));
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <h1 className="sr-only">Detail Postingan</h1>
      {/* Back button & owner actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/"
          data-testid="back-to-posts-link"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft size={18} />
          Kembali ke Postingan
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="edit-cover-btn"
              onClick={() => setShowCoverModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
            >
              <IconPhotoUp size={16} />
              Ubah Cover
            </button>
            <button
              type="button"
              data-testid="edit-detail-post-btn"
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
            >
              <IconEdit size={16} />
              Ubah Postingan
            </button>
            <button
              type="button"
              data-testid="delete-detail-post-btn"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
            >
              <IconTrash size={16} />
              Hapus
            </button>
          </div>
        )}
      </div>

      {/* Post card */}
      <article className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {post.cover ? (
          <img
            src={post.cover}
            alt={`Cover postingan ${post.id}`}
            data-testid="post-cover-image"
            className="w-full max-h-[28rem] object-cover bg-slate-100"
          />
        ) : (
          <div
            data-testid="post-cover-placeholder"
            className="w-full h-56 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-300"
          >
            <IconPhotoOff size={48} />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            {post.author?.photo ? (
              <img
                src={post.author.photo}
                alt={post.author.name}
                className="w-11 h-11 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold">
                {post.author?.name ? post.author.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div>
              <p data-testid="post-author-name" className="text-sm font-bold text-slate-800">
                {post.author?.name || "Pengguna"}
              </p>
              <p className="text-xs text-slate-600 inline-flex items-center gap-1">
                <IconCalendar size={13} />
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>

          <p
            data-testid="post-description"
            className="text-base text-slate-700 leading-relaxed whitespace-pre-line"
          >
            {post.description}
          </p>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              data-testid="like-btn"
              onClick={handleToggleLike}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                liked
                  ? "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100"
                  : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              {liked ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
              <span data-testid="likes-count">{likes.length}</span>
              <span>{liked ? "Disukai" : "Suka"}</span>
            </button>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
              <IconMessageCircle size={18} />
              <span data-testid="comments-count">{comments.length}</span>
              <span>Komentar</span>
            </span>
          </div>
        </div>
      </article>

      {/* Comments */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
        <h2 className="text-lg font-bold text-slate-800">Komentar</h2>

        <form onSubmit={handleSubmitComment} className="flex flex-col gap-3">
          <textarea
            data-testid="comment-input"
            value={comment}
            onChange={changeComment}
            rows={3}
            placeholder="Tulis komentar Anda..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              data-testid="submit-comment-btn"
              disabled={sendingComment}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
            >
              {sendingComment ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <IconSend size={18} stroke={2.5} />
                  <span>Kirim Komentar</span>
                </>
              )}
            </button>
          </div>
        </form>

        {comments.length === 0 ? (
          <p data-testid="no-comments" className="text-sm text-slate-600 text-center py-4">
            Belum ada komentar. Jadilah yang pertama berkomentar!
          </p>
        ) : (
          <ul className="space-y-3">
            {comments.map((item) => {
              const isMine = item.id === myCommentId;
              return (
                <li
                  key={`comment-${item.id}`}
                  data-testid={`comment-${item.id}`}
                  className={`rounded-2xl border p-4 flex items-start justify-between gap-3 ${
                    isMine ? "border-indigo-200 bg-indigo-50/50" : "border-slate-100 bg-slate-50/60"
                  }`}
                >
                  <div className="min-w-0">
                    {isMine && (
                      <span className="inline-block mb-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                        Komentar Anda
                      </span>
                    )}
                    <p className="text-sm text-slate-700 whitespace-pre-line break-words">
                      {item.comment}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{formatDate(item.created_at)}</p>
                  </div>
                  {isMine && (
                    <button
                      type="button"
                      data-testid="delete-comment-btn"
                      onClick={handleDeleteComment}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Hapus Komentar"
                    >
                      <IconTrash size={18} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ChangeCoverModal
        show={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        post={post}
      />
      <ChangeModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        post={post}
      />
    </div>
  );
}

export default DetailPage;
