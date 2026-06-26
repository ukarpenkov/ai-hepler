const AVATARS = {
  user: { src: "/avatars/candidate.webp", alt: "Candidate" },
  assistant: { src: "/avatars/interviewer.webp", alt: "Interviewer" },
} as const;

interface ChatAvatarProps {
  role: "user" | "assistant";
}

export default function ChatAvatar({ role }: ChatAvatarProps) {
  const { src, alt } = AVATARS[role];

  return (
    // Pre-optimized static WebP avatars (40px); no next/image pipeline needed
    // eslint-disable-next-line @next/next/no-img-element -- tiny static assets in /public
    <img
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="w-10 h-10 rounded-full object-cover shrink-0 shadow-[0_4px_12px_var(--shadow)] ring-1 ring-black/5"
    />
  );
}
