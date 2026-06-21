export default function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-[75%] self-start animate-[messageIn_0.4s_ease]">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-[0_4px_12px_var(--shadow)] bg-gradient-to-br from-primary to-pink-500 text-white">
      </div>
      <div className="px-4 py-3.5 rounded-2xl rounded-tl-[4px] bg-[var(--msg-ai)] backdrop-blur-[10px] border border-[var(--border)] shadow-[0_4px_15px_var(--shadow)]">
        <div className="overflow-hidden whitespace-nowrap border-r-2 border-primary text-primary font-medium text-sm inline-block animate-[typing_2s_steps(6,end)_infinite,blink_.7s_step-end_infinite]">
          Typing...
        </div>
      </div>
    </div>
  );
}
