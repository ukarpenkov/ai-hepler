interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  topic?: string;
  timestamp?: string;
}

function getCurrentTime() {
  const now = new Date();
  return now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
}

export default function MessageBubble({ role, content, topic, timestamp }: MessageBubbleProps) {
  const isUser = role === "user";
  const time = timestamp || getCurrentTime();

  return (
    <div className={`flex gap-3 max-w-[85%] animate-[messageIn_0.4s_ease] ${isUser ? "self-end flex-row-reverse" : "self-start"}`}>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-[0_4px_12px_var(--shadow)] ${
          isUser
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
            : "bg-gradient-to-br from-primary to-pink-500 text-white"
        }`}
      >
        {isUser ? "" : ""}
      </div>
      <div className="min-w-0">
        <div
          className={`px-[18px] py-3.5 rounded-[18px] text-lg leading-[1.5] backdrop-blur-[10px] border border-[var(--border)] shadow-[0_4px_15px_var(--shadow)] break-words ${
            isUser
              ? "bg-gradient-to-br from-primary to-pink-500 text-white border-none rounded-tr-[4px]"
              : "bg-[var(--msg-ai)] text-content-primary rounded-tl-[4px]"
          }`}
        >
          {topic && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {topic.split(",").map((t) => (
                <span
                  key={t.trim()}
                  className="inline-block px-2.5 py-0.5 text-sm font-medium rounded-full bg-primary/15 text-primary border border-primary/20"
                >
                  {t.trim()}
                </span>
              ))}
            </div>
          )}
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
        <p className={`text-[15px] text-content-secondary mt-1.5 px-2 ${isUser ? "text-right" : ""}`}>
          {time}
        </p>
      </div>
    </div>
  );
}
