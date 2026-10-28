import { Chip } from "@/components/ui/Chip";
import { joinStatusCards } from "@/content/join";

/** Stack of email status cards beside the waitlist form. Decorative. */
export function StatusCards() {
  return (
    <ul aria-hidden="true" className="anim-stagger m-0 flex list-none flex-col items-center gap-3 p-0">
      {joinStatusCards.map((card) => (
        <li
          key={card.title}
          className="box-border flex w-[min(100%,360px)] items-center justify-between gap-3 rounded-[18px] border border-line bg-white px-[18px] py-4 shadow-tile"
          style={{ transform: card.tilt }}
        >
          <div>
            <p className="m-0 text-sm font-semibold">{card.title}</p>
            <p className="m-0 text-xs text-subtle">to {card.to}</p>
          </div>
          <Chip tone={card.tone} className="px-[11px] py-[5px]">
            {card.label}
          </Chip>
        </li>
      ))}
    </ul>
  );
}
