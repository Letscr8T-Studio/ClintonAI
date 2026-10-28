import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { waitlistCopy as copy } from "@/content/join";
import { WaitlistForm } from "./WaitlistForm";

const fetchMock = vi.fn();

function respond(status: number, body: unknown) {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

async function submit(email: string) {
  const user = userEvent.setup();
  render(<WaitlistForm />);
  await user.type(screen.getByLabelText(copy.label), email);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("WaitlistForm", () => {
  it("shows an error and does not call the API for an invalid email", async () => {
    await submit("not-an-email");
    expect(screen.getByRole("alert")).toHaveTextContent(copy.errors.invalid);
    expect(screen.getByLabelText(copy.label)).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("joins, remembers the email and offers priority access", async () => {
    respond(200, { ok: true });
    await submit("Ada@Example.com");

    expect(await screen.findByRole("status")).toHaveTextContent(copy.joined);
    expect(screen.getByRole("button", { name: copy.surveyCta })).toBeInTheDocument();
    expect(window.localStorage.getItem(copy.storageKey)).toBe("ada@example.com");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/waitlist");
    expect(JSON.parse(init.body)).toMatchObject({ email: "ada@example.com", company: "", source: "direct" });
  });

  it("shows the server's error message", async () => {
    respond(400, { ok: false, error: "That email doesn't look right." });
    await submit("ada@example.com");
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("That email doesn't look right."),
    );
  });

  it("shows a connection error when the request fails", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    await submit("ada@example.com");
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(copy.errors.network));
  });

  it("recognises a returning visitor, including the pre-rename storage key", () => {
    window.localStorage.setItem(copy.legacyStorageKey, "old@example.com");
    render(<WaitlistForm />);
    expect(screen.getByRole("status")).toHaveTextContent(copy.joined);
  });
});
