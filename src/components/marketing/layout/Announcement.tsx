import { announcement } from "@/content/navigation";

export function Announcement() {
  return (
    <a
      href={announcement.href}
      className="block bg-ink px-4 py-2.5 text-center text-[13px] text-on-brand no-underline hover:text-white"
    >
      {announcement.text} <span className="font-semibold text-white">{announcement.cta}</span>
    </a>
  );
}
