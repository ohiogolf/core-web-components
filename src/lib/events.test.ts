import { describe, it, expect, vi } from "vitest";
import {
  dispatchClubSearch,
  dispatchCountySelected,
  dispatchClubDetail,
} from "./events";

describe("dispatchClubSearch", () => {
  it("dispatches a bubbling, composed custom event with the search detail", () => {
    const target = new EventTarget();
    const handler = vi.fn();
    target.addEventListener("club-search", handler);

    dispatchClubSearch(target, { counties: "Franklin", label: "Franklin County" });

    expect(handler).toHaveBeenCalledOnce();
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ counties: "Franklin", label: "Franklin County" });
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it("dispatches with null detail to clear results", () => {
    const target = new EventTarget();
    const handler = vi.fn();
    target.addEventListener("club-search", handler);

    dispatchClubSearch(target, null);

    expect(handler.mock.calls[0][0].detail).toBeNull();
  });
});

describe("dispatchCountySelected", () => {
  it("dispatches a bubbling, composed custom event with county info", () => {
    const target = new EventTarget();
    const handler = vi.fn();
    target.addEventListener("county-selected", handler);

    dispatchCountySelected(target, {
      county: "Franklin",
      regionId: "oga",
      regionName: "Ohio Golf Association",
    });

    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({
      county: "Franklin",
      regionId: "oga",
      regionName: "Ohio Golf Association",
    });
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });
});

describe("dispatchClubDetail", () => {
  it("dispatches a bubbling, composed custom event with club info", () => {
    const target = new EventTarget();
    const handler = vi.fn();
    target.addEventListener("club-detail", handler);

    dispatchClubDetail(target, { clubId: 123, clubName: "Scioto Country Club" });

    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ clubId: 123, clubName: "Scioto Country Club" });
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });
});
