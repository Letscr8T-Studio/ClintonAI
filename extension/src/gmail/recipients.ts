import { normaliseEmail } from "@/lib/email";
import { gmail, type RecipientKind } from "./selectors";

const ADDRESS = /[^\s<>,;:"'()[\]]+@[^\s<>,;:"'()[\]]+/g;

/** Addresses in text like `Ada <ada@x.com>, bola@y.com`, lower-cased, valid ones only. */
export function addressesIn(text: string): string[] {
  return (text.match(ADDRESS) ?? []).flatMap((a) => normaliseEmail(a) ?? []);
}

const unique = (list: string[]) => [...new Set(list)];

/**
 * One kind of recipient in a compose window. Gmail's hidden fields first (they hold every
 * address, even ones scrolled out of view); otherwise the chips in that row.
 */
export function readRecipients(compose: Element, kind: RecipientKind): string[] {
  const hidden = [...compose.querySelectorAll<HTMLInputElement>(gmail.recipientInput(kind))];
  const fromHidden = hidden.flatMap((input) => addressesIn(input.value));
  if (fromHidden.length) return unique(fromHidden);

  const chips = [...compose.querySelectorAll(`${gmail.recipientRow(kind)} :is(${gmail.recipientChip})`)];
  return unique(
    chips.flatMap((chip) =>
      addressesIn(`${chip.getAttribute("email") ?? ""} ${chip.getAttribute("data-hovercard-id") ?? ""}`),
    ),
  );
}
