import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { privacyPolicy } from "@/content/legal/privacy";
import { termsOfService } from "@/content/legal/terms";
import { a11yViolations } from "@/test/a11y";
import { LegalPage } from "./LegalPage";

describe("LegalPage", () => {
  it.each([privacyPolicy, termsOfService])(
    "renders $title with a contents list, and is accessible",
    async (doc) => {
      const { container } = render(<LegalPage doc={doc} />);
      expect(screen.getByRole("heading", { level: 1, name: doc.title })).toBeInTheDocument();
      expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(doc.sections.length);
      expect(await a11yViolations(container)).toEqual([]);
    },
  );

  it("states Google's Limited Use commitment word for word (required for verification)", () => {
    render(<LegalPage doc={privacyPolicy} />);
    expect(
      screen.getByText(
        /will adhere to the Google API Services User Data Policy, including the Limited Use requirements\./,
      ),
    ).toBeInTheDocument();
  });

  it("never promises to delete email from someone's inbox (trust rule 7)", () => {
    const text = JSON.stringify([privacyPolicy, termsOfService]).toLowerCase();
    expect(text).toContain("nobody can delete it from someone else's inbox");
    expect(text).not.toMatch(/we (can|will) delete (it|emails?) from/);
  });
});
