import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ChangeModal from "./ChangeModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

describe("ChangeModal", () => {
  const mockPost = { id: 5, description: "Deskripsi awal" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when show is false", () => {
    const { container } = renderWithProviders(
      <ChangeModal show={false} onClose={vi.fn()} post={mockPost} />
    );
    expect(container.firstChild).toBeNull();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should not render when post is missing", () => {
    const { container } = renderWithProviders(
      <ChangeModal show={true} onClose={vi.fn()} post={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should prefill the description from post", () => {
    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} post={mockPost} />);

    expect(screen.getByTestId("edit-post-description-input")).toHaveValue("Deskripsi awal");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should prefill empty string when post has no description", () => {
    renderWithProviders(
      <ChangeModal show={true} onClose={vi.fn()} post={{ id: 1, description: null }} />
    );

    expect(screen.getByTestId("edit-post-description-input")).toHaveValue("");
  });

  it("should show validation error when description is empty", () => {
    const errorSpy = vi
      .spyOn(toolsHelper, "showErrorDialog")
      .mockImplementation(() => Promise.resolve({} as never));
    const changeSpy = vi.spyOn(postAction, "asyncSetIsPostChange");

    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} post={mockPost} />);

    fireEvent.change(screen.getByTestId("edit-post-description-input"), {
      target: { value: "  " },
    });
    fireEvent.submit(screen.getByTestId("edit-post-modal").querySelector("form")!);

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it("should dispatch asyncSetIsPostChange with trimmed description and show loading", () => {
    const changeSpy = vi
      .spyOn(postAction, "asyncSetIsPostChange")
      .mockReturnValue(() => Promise.resolve());

    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} post={mockPost} />);

    fireEvent.change(screen.getByTestId("edit-post-description-input"), {
      target: { value: "  Deskripsi baru  " },
    });
    fireEvent.submit(screen.getByTestId("edit-post-modal").querySelector("form")!);

    expect(changeSpy).toHaveBeenCalledWith(5, "Deskripsi baru");
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
  });

  it("should refresh the post and close when change succeeded", () => {
    const postSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => Promise.resolve());
    const onClose = vi.fn();

    renderWithProviders(<ChangeModal show={true} onClose={onClose} post={mockPost} />, {
      preloadedState: { isPostChange: true, isPostChanged: true },
    });

    expect(postSpy).toHaveBeenCalledWith(5);
    expect(onClose).toHaveBeenCalled();
  });

  it("should stay open when change finished but failed", () => {
    const onClose = vi.fn();

    renderWithProviders(<ChangeModal show={true} onClose={onClose} post={mockPost} />, {
      preloadedState: { isPostChange: true, isPostChanged: false },
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should close when close or cancel button clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal show={true} onClose={onClose} post={mockPost} />);

    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    fireEvent.click(screen.getByTestId("cancel-edit-modal-btn"));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("should not propagate clicks from the dialog panel", () => {
    const outer = vi.fn();
    renderWithProviders(
      <div onClick={outer}>
        <ChangeModal show={true} onClose={vi.fn()} post={mockPost} />
      </div>
    );

    fireEvent.click(screen.getByTestId("edit-post-modal").firstElementChild!);
    expect(outer).not.toHaveBeenCalled();
  });
});
