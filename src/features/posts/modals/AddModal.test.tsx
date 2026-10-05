import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import AddModal from "./AddModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

describe("AddModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when show is false", () => {
    const { container } = renderWithProviders(<AddModal show={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should lock body scroll when shown", () => {
    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />);
    expect(screen.getByTestId("add-post-modal")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should show validation error if description is empty", () => {
    const errorSpy = vi
      .spyOn(toolsHelper, "showErrorDialog")
      .mockImplementation(() => Promise.resolve({} as never));
    const addSpy = vi.spyOn(postAction, "asyncSetIsPostAdd");

    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />);

    const descInput = screen.getByTestId("add-post-description-input");
    fireEvent.change(descInput, { target: { value: "   " } });
    fireEvent.submit(screen.getByTestId("add-post-modal").querySelector("form")!);

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
    expect(addSpy).not.toHaveBeenCalled();
  });

  it("should dispatch asyncSetIsPostAdd with trimmed description and show loading", () => {
    const addSpy = vi.spyOn(postAction, "asyncSetIsPostAdd").mockReturnValue(() => Promise.resolve());

    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByTestId("add-post-description-input"), {
      target: { value: "  Halo dunia  " },
    });
    fireEvent.submit(screen.getByTestId("add-post-modal").querySelector("form")!);

    expect(addSpy).toHaveBeenCalledWith("Halo dunia");
    expect(screen.getByText("Memublikasikan...")).toBeInTheDocument();
    expect(screen.getByTestId("submit-add-modal-btn")).toBeDisabled();
  });

  it("should reload posts, reset form and close when add succeeded", () => {
    const postsSpy = vi.spyOn(postAction, "asyncSetPosts").mockReturnValue(() => Promise.resolve());
    const onClose = vi.fn();

    renderWithProviders(<AddModal show={true} onClose={onClose} isMe={true} />, {
      preloadedState: { isPostAdd: true, isPostAdded: true },
    });

    expect(postsSpy).toHaveBeenCalledWith(true);
    expect(onClose).toHaveBeenCalled();
  });

  it("should reload default posts when isMe is not provided", () => {
    const postsSpy = vi.spyOn(postAction, "asyncSetPosts").mockReturnValue(() => Promise.resolve());

    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />, {
      preloadedState: { isPostAdd: true, isPostAdded: true },
    });

    expect(postsSpy).toHaveBeenCalledWith(false);
  });

  it("should stay open when add finished but failed", () => {
    const onClose = vi.fn();

    renderWithProviders(<AddModal show={true} onClose={onClose} />, {
      preloadedState: { isPostAdd: true, isPostAdded: false },
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId("add-post-modal")).toBeInTheDocument();
  });

  it("should close when close or cancel button clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(<AddModal show={true} onClose={onClose} />);

    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("cancel-add-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("should not propagate clicks from the dialog panel", () => {
    const outer = vi.fn();
    renderWithProviders(
      <div onClick={outer}>
        <AddModal show={true} onClose={vi.fn()} />
      </div>
    );

    const panel = screen.getByTestId("add-post-modal").firstElementChild!;
    fireEvent.click(panel);
    expect(outer).not.toHaveBeenCalled();
  });
});
