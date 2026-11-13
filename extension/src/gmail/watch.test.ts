import { describe, expect, it, vi } from "vitest";
import newCompose from "./fixtures/compose-new.html?raw";
import { watchComposeWindows } from "./watch";

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

describe("watchComposeWindows", () => {
  it("opens once per compose window, closes when it goes, and stops cleanly", async () => {
    document.body.innerHTML = "<main></main>";
    const closed = vi.fn();
    const opened = vi.fn(() => closed);
    const stop = watchComposeWindows(document.body, opened, 0);
    expect(opened).not.toHaveBeenCalled();

    const slot = document.createElement("div");
    slot.innerHTML = newCompose;
    document.body.append(slot);
    await settle();
    expect(opened).toHaveBeenCalledTimes(1);

    // Gmail redraws parts of the window as the person types: still the same window.
    slot.querySelector("[g_editable]")!.append(document.createElement("div"));
    await settle();
    expect(opened).toHaveBeenCalledTimes(1);

    slot.remove();
    await settle();
    expect(closed).toHaveBeenCalledTimes(1);

    document.body.append(slot);
    await settle();
    expect(opened).toHaveBeenCalledTimes(2);
    stop();
    expect(closed).toHaveBeenCalledTimes(2);
    document.body.innerHTML = "";
  });
});
