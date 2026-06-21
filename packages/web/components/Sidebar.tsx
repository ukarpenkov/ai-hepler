"use client";

interface Session {
  id: string;
  title: string;
  date: string;
}

interface SidebarProps {
  isOpen: boolean;
  sessions: Session[];
}

export default function Sidebar({ isOpen, sessions }: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 w-80 h-screen glass border-r border-[var(--border)] z-[99] pt-[72px] px-5 pb-5 overflow-y-auto transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
        <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-5 px-2.5">
          История сессий
        </div>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-3.5 px-4 rounded-xl bg-surface-card border border-[var(--border)] cursor-pointer transition-all duration-300 hover:bg-primary hover:text-white hover:translate-x-1.5 hover:shadow-lg hover:shadow-primary/30"
            >
              <div className="text-sm font-medium mb-1">{session.title}</div>
              <div className="text-xs text-content-secondary">{session.date}</div>
            </div>
          ))}
        </div>
      </aside>
  );
}
