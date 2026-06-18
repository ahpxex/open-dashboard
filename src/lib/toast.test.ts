import { beforeEach, describe, expect, it, vi } from "vitest";

const toastMock = vi.hoisted(() =>
  Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
);

vi.mock("sonner", () => ({ toast: toastMock }));

import { errorMessage, toastError, toastSuccess } from "./toast";

beforeEach(() => {
  toastMock.success.mockClear();
  toastMock.error.mockClear();
});

describe("errorMessage", () => {
  it("extracts the message from an Error", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
  });

  it("returns a raw non-empty string as-is", () => {
    expect(errorMessage("UNAUTHORIZED")).toBe("UNAUTHORIZED");
  });

  it("falls back for empty / unknown values", () => {
    expect(errorMessage(new Error(""))).toBe("Something went wrong.");
    expect(errorMessage(undefined)).toBe("Something went wrong.");
    expect(errorMessage({}, "custom")).toBe("custom");
  });
});

describe("toast helpers", () => {
  it("toastError forwards the extracted message to sonner", () => {
    toastError(new Error("nope"), "fallback");
    expect(toastMock.error).toHaveBeenCalledWith("nope");
  });

  it("toastError uses the fallback when there is no message", () => {
    toastError(undefined, "could not save");
    expect(toastMock.error).toHaveBeenCalledWith("could not save");
  });

  it("toastSuccess forwards the message to sonner", () => {
    toastSuccess("saved");
    expect(toastMock.success).toHaveBeenCalledWith("saved");
  });
});
