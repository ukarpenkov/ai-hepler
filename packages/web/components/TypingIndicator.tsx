import ChatAvatar from "./ChatAvatar";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-[75%] self-start animate-[messageIn_0.4s_ease]">
      <ChatAvatar role="assistant" />
      <div className="px-4 py-3.5 rounded-2xl rounded-tl-[4px] bg-[var(--msg-ai)] backdrop-blur-[10px] border border-[var(--border)] shadow-[0_4px_15px_var(--shadow)]">
        <div className="overflow-hidden whitespace-nowrap border-r-2 border-primary text-primary font-medium text-sm inline-block animate-[typing_2s_steps(6,end)_infinite,blink_.7s_step-end_infinite]">
          Typing...
        </div>
      </div>
    </div>
  );
}
