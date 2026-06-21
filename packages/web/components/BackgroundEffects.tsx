export default function BackgroundEffects() {
  return (
    <>
      <div className="fixed w-[600px] h-[600px] bg-[radial-gradient(circle,var(--accent)_0%,transparent_70%)] opacity-15 -top-[200px] -right-[200px] rounded-full animate-float pointer-events-none" />
      <div className="fixed w-[500px] h-[500px] bg-[radial-gradient(circle,#ec4899_0%,transparent_70%)] opacity-10 -bottom-[200px] -left-[200px] rounded-full pointer-events-none [animation:float_25s_infinite_ease-in-out_reverse]" />
    </>
  );
}
