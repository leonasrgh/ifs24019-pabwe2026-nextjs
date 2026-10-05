import apiHelper from "../../../helpers/apiHelper";
import { DELCOM_BASEURL } from "@/lib/config";

const postApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/posts`;

  function _url(path) {
    return BASE_URL + path;
  }

  async function _parse(response, fallbackMessage) {
    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || fallbackMessage);
    }
    return result;
  }

  // GET /posts (+ ?is_me=1 untuk postingan milik sendiri)
  async function getPosts(isMe = false) {
    const response = await apiHelper.fetchData(_url(isMe ? "/?is_me=1" : "/"), {
      method: "GET",
    });

    const result = await _parse(response, "Gagal mengambil data postingan");
    return result.data?.posts || [];
  }

  // GET /posts/:id
  async function getPostById(postId) {
    const response = await apiHelper.fetchData(_url(`/${postId}`), {
      method: "GET",
    });

    const result = await _parse(response, "Gagal mengambil detail postingan");
    return result.data?.post;
  }

  // POST /posts
  async function postPost(description) {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });

    const result = await _parse(response, "Gagal menambahkan postingan");
    return result.data;
  }

  // PUT /posts/:id
  async function putPost(postId, description) {
    const response = await apiHelper.fetchData(_url(`/${postId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });

    const result = await _parse(response, "Gagal mengubah postingan");
    return result.message;
  }

  // POST /posts/:id/cover (multipart/form-data)
  async function postPostCover(postId, cover) {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");
    const response = await apiHelper.fetchData(_url(`/${postId}/cover`), {
      method: "POST",
      body: formData,
    });

    const result = await _parse(response, "Gagal mengubah cover");
    return result.message;
  }

  // DELETE /posts/:id
  async function deletePost(postId) {
    const response = await apiHelper.fetchData(_url(`/${postId}`), {
      method: "DELETE",
    });

    const result = await _parse(response, "Gagal menghapus postingan");
    return result.message;
  }

  // POST /posts/:id/likes  { like: 1 | 0 }
  async function postPostLike(postId, like) {
    const response = await apiHelper.fetchData(_url(`/${postId}/likes`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ like: like ? 1 : 0 }),
    });

    const result = await _parse(response, "Gagal mengubah status suka");
    return result.message;
  }

  // POST /posts/:id/comments  { comment: string }
  async function postPostComment(postId, comment) {
    const response = await apiHelper.fetchData(_url(`/${postId}/comments`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment }),
    });

    const result = await _parse(response, "Gagal menambahkan komentar");
    return result.message;
  }

  // DELETE /posts/:id/comments
  async function deletePostComment(postId) {
    const response = await apiHelper.fetchData(_url(`/${postId}/comments`), {
      method: "DELETE",
    });

    const result = await _parse(response, "Gagal menghapus komentar");
    return result.message;
  }

  // DELETE /posts (hapus seluruh postingan milik pengguna)
  async function deleteAllPosts() {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "DELETE",
    });

    const result = await _parse(response, "Gagal menghapus semua postingan");
    return result.message;
  }

  return {
    getPosts,
    getPostById,
    postPost,
    putPost,
    postPostCover,
    deletePost,
    postPostLike,
    postPostComment,
    deletePostComment,
    deleteAllPosts,
  };
})();

export default postApi;
