import { describe, it, expect, vi, beforeEach } from "vitest";
import postApi from "./postApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => body,
  } as unknown as Response);
}

describe("postApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getPosts", () => {
    it("should fetch all posts without is_me filter", async () => {
      const spy = mockResponse({
        status: "success",
        data: { posts: [{ id: 1 }, { id: 2 }] },
      });

      const posts = await postApi.getPosts();

      expect(posts).toEqual([{ id: 1 }, { id: 2 }]);
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/posts\/$/), {
        method: "GET",
      });
    });

    it("should fetch own posts with is_me=1 filter", async () => {
      const spy = mockResponse({ status: "success", data: { posts: [{ id: 3 }] } });

      const posts = await postApi.getPosts(true);

      expect(posts).toEqual([{ id: 3 }]);
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/posts\/\?is_me=1$/), {
        method: "GET",
      });
    });

    it("should return empty array when data.posts is missing", async () => {
      mockResponse({ status: "success" });
      expect(await postApi.getPosts()).toEqual([]);
    });

    it("should accept success flag as alternative to status", async () => {
      mockResponse({ success: true, data: { posts: [{ id: 9 }] } });
      expect(await postApi.getPosts()).toEqual([{ id: 9 }]);
    });

    it("should throw API message on failure", async () => {
      mockResponse({ status: "fail", message: "Unauthenticated." });
      await expect(postApi.getPosts()).rejects.toThrow("Unauthenticated.");
    });

    it("should throw fallback message when API gives none", async () => {
      mockResponse({ status: "fail" });
      await expect(postApi.getPosts()).rejects.toThrow("Gagal mengambil data postingan");
    });
  });

  describe("getPostById", () => {
    it("should return post detail", async () => {
      const spy = mockResponse({ status: "success", data: { post: { id: 5 } } });

      const post = await postApi.getPostById(5);

      expect(post).toEqual({ id: 5 });
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/posts\/5$/), {
        method: "GET",
      });
    });

    it("should return undefined when data is missing", async () => {
      mockResponse({ status: "success" });
      expect(await postApi.getPostById(5)).toBeUndefined();
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(postApi.getPostById(5)).rejects.toThrow("Gagal mengambil detail postingan");
    });
  });

  describe("postPost", () => {
    it("should create a post with JSON description and return data", async () => {
      const spy = mockResponse({ status: "success", data: { post_id: 6 } });

      const data = await postApi.postPost("Contoh deskripsi");

      expect(data).toEqual({ post_id: 6 });
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/posts\/$/), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Contoh deskripsi" }),
      });
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(postApi.postPost("")).rejects.toThrow("Data tidak valid");
    });
  });

  describe("putPost", () => {
    it("should update a post description and return message", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah data" });

      const msg = await postApi.putPost(1, "Baru");

      expect(msg).toBe("Berhasil mengubah data");
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/posts\/1$/), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Baru" }),
      });
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(postApi.putPost(1, "")).rejects.toThrow("Gagal mengubah postingan");
    });
  });

  describe("postPostCover", () => {
    it("should upload cover with FormData", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah cover" });
      const file = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });

      const msg = await postApi.postPostCover(1, file);

      expect(msg).toBe("Berhasil mengubah cover");
      const [url, options] = spy.mock.calls[0];
      expect(url).toMatch(/\/posts\/1\/cover$/);
      expect(options.method).toBe("POST");
      expect((options.body as FormData).get("cover")).toBeInstanceOf(File);
    });

    it("should fall back to default filename when file has no name", async () => {
      const spy = mockResponse({ status: "success", message: "ok" });
      const blob = new Blob(["dummy"], { type: "image/png" });

      await postApi.postPostCover(2, blob);

      const body = spy.mock.calls[0][1].body as FormData;
      expect((body.get("cover") as File).name).toBe("cover.jpg");
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      const file = new File(["x"], "cover.png", { type: "image/png" });
      await expect(postApi.postPostCover(1, file)).rejects.toThrow("Gagal mengubah cover");
    });
  });

  describe("deletePost", () => {
    it("should delete a post and return message", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil menghapus data" });

      expect(await postApi.deletePost(4)).toBe("Berhasil menghapus data");
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/posts\/4$/), {
        method: "DELETE",
      });
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(postApi.deletePost(4)).rejects.toThrow("Gagal menghapus postingan");
    });
  });

  describe("postPostLike", () => {
    it("should send like=1 when liking", async () => {
      const spy = mockResponse({ status: "success", message: "ok" });

      await postApi.postPostLike(1, true);

      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/posts\/1\/likes$/), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ like: 1 }),
      });
    });

    it("should send like=0 when unliking", async () => {
      const spy = mockResponse({ status: "success", message: "ok" });

      await postApi.postPostLike(1, false);

      expect(spy.mock.calls[0][1].body).toBe(JSON.stringify({ like: 0 }));
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(postApi.postPostLike(1, true)).rejects.toThrow("Gagal mengubah status suka");
    });
  });

  describe("postPostComment", () => {
    it("should add a comment", async () => {
      const spy = mockResponse({
        status: "success",
        message: "Berhasil memberikan komentar pada postingan",
      });

      const msg = await postApi.postPostComment(1, "Keren!");

      expect(msg).toBe("Berhasil memberikan komentar pada postingan");
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/posts\/1\/comments$/), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: "Keren!" }),
      });
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(postApi.postPostComment(1, "")).rejects.toThrow("Gagal menambahkan komentar");
    });
  });

  describe("deletePostComment", () => {
    it("should delete own comment", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil menghapus komentar" });

      expect(await postApi.deletePostComment(1)).toBe("Berhasil menghapus komentar");
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/posts\/1\/comments$/), {
        method: "DELETE",
      });
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(postApi.deletePostComment(1)).rejects.toThrow("Gagal menghapus komentar");
    });
  });

  describe("deleteAllPosts", () => {
    it("should delete all own posts", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil menghapus semua" });

      expect(await postApi.deleteAllPosts()).toBe("Berhasil menghapus semua");
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/posts\/$/), {
        method: "DELETE",
      });
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail", message: "Unauthenticated." });
      await expect(postApi.deleteAllPosts()).rejects.toThrow("Unauthenticated.");
    });
  });
});
