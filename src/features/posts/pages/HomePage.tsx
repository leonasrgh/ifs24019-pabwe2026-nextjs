"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AddModal from "../modals/AddModal";
import {
  asyncSetPosts,
  asyncSetIsPostDeleteAll,
  setIsPostDeleteAllActionCreator,
  setIsPostDeletedAllActionCreator,
} from "../states/action";
import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import {
  IconPlus,
  IconNews,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconSearch,
  IconLoader2,
  IconTrash,
  IconPhotoOff,
} from "@tabler/icons-react";

function countOf(list) {
  return list ? list.length : 0;
}

function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMe = searchParams.get("is_me") === "1";

  const profile = useAppSelector((state) => state.profile);
  const posts = useAppSelector((state) => state.posts);
  const isPostDeleteAll = useAppSelector((state) => state.isPostDeleteAll);
  const isPostDeletedAll = useAppSelector((state) => state.isPostDeletedAll);

  const [loadingPosts, setLoadingPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingPosts(true);
    Promise.resolve(dispatch(asyncSetPosts(isMe))).finally(() => {
      if (isMounted) setLoadingPosts(false);
    });
    return () => {
      isMounted = false;
    };
  }, [isMe, dispatch]);

  useEffect(() => {
    if (isPostDeleteAll) {
      dispatch(setIsPostDeleteAllActionCreator(false));
      if (isPostDeletedAll) {
        dispatch(setIsPostDeletedAllActionCreator(false));
        setLoadingPosts(true);
        Promise.resolve(dispatch(asyncSetPosts(isMe))).finally(() => {
          setLoadingPosts(false);
        });
      }
    }
  }, [isPostDeleteAll, isPostDeletedAll, isMe, dispatch]);

  if (!profile) return null;

  async function handleDeleteAll() {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus SEMUA postingan milik Anda? Tindakan ini tidak dapat dibatalkan."
    );
    if (result.isConfirmed) {
      dispatch(asyncSetIsPostDeleteAll());
    }
  }

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const description = post.description ? post.description.toLowerCase() : "";
    const authorName = post.author?.name ? post.author.name.toLowerCase() : "";
    return description.includes(q) || authorName.includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isMe ? "Postingan Saya" : "Linimasa Postingan"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isMe
              ? "Kelola seluruh postingan yang pernah Anda publikasikan."
              : "Lihat, sukai, dan komentari postingan dari seluruh pengguna."}
          </p>
        </div>
        <button
          type="button"
          data-testid="add-post-btn"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <IconPlus size={18} stroke={2.5} />
          <span>Buat Postingan</span>
        </button>
      </div>

      {/* Controls: tabs + search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <IconSearch
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            data-testid="search-post-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari deskripsi atau nama pembuat..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              data-testid="tab-all-btn"
              onClick={() => router.push("/")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                !isMe ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              data-testid="tab-me-btn"
              onClick={() => router.push("/?is_me=1")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isMe ? "bg-white text-indigo-700 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              Postingan Saya
            </button>
          </div>

          {isMe && (
            <button
              type="button"
              data-testid="delete-all-posts-btn"
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
            >
              <IconTrash size={16} />
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      {/* Posts */}
      {loadingPosts && filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 px-6 py-16 text-center text-slate-400">
          <IconLoader2 size={36} className="mx-auto text-indigo-600 animate-spin mb-2" />
          <p className="font-medium text-slate-600">Memuat postingan...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 px-6 py-16 text-center text-slate-400">
          <IconNews size={40} className="mx-auto text-slate-300 mb-2" />
          <p className="font-medium">Belum ada postingan yang cocok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const liked = (post.likes || []).includes(profile.id);
            return (
              <Link
                key={`post-${post.id}`}
                href={`/posts/${post.id}`}
                data-testid={`post-card-${post.id}`}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col"
              >
                {post.cover ? (
                  <img
                    src={post.cover}
                    alt={`Cover postingan ${post.id}`}
                    className="w-full h-48 object-cover bg-slate-100"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-300">
                    <IconPhotoOff size={40} />
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1 gap-4">
                  <div className="flex items-center gap-3">
                    {post.author?.photo ? (
                      <img
                        src={post.author.photo}
                        alt={post.author.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                        {post.author?.name ? post.author.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {post.author?.name || "Pengguna"}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(post.created_at)}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
                    {post.description}
                  </p>

                  <div className="flex items-center gap-5 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
                    <span
                      data-testid={`post-likes-${post.id}`}
                      className={`inline-flex items-center gap-1.5 ${
                        liked ? "text-rose-600" : ""
                      }`}
                    >
                      {liked ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
                      {countOf(post.likes)}
                    </span>
                    <span
                      data-testid={`post-comments-${post.id}`}
                      className="inline-flex items-center gap-1.5"
                    >
                      <IconMessageCircle size={16} />
                      {countOf(post.comments)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <AddModal show={showAddModal} onClose={() => setShowAddModal(false)} isMe={isMe} />
    </div>
  );
}

export default HomePage;
