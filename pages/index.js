// pages/index.js
export default function Home() {
  return (
    <main style={{ padding: 28, fontFamily: "var(--font-body)" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 36 }}>Pragati Sharma — Portfolio Assistant Demo</h1>
      <p>Open the assistant using your site button — it will call the embed overlay which loads the centered assistant modal.</p>
      <p style={{ marginTop: 20, color: "#6b7280" }}>
        NOTE: If you still see a floating assistant at bottom-right, do a hard refresh (Ctrl/Cmd+Shift+R) — older code may be cached.
      </p>
    </main>
  );
}
