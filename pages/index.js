// pages/index.js
export default function Home() {
  const vercelEmbedUrl = "/embed"; // links to your deployed embed page

  return (
    <main style={{ padding: 28, fontFamily: "var(--font-body)" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 36 }}>Pragati Sharma — Portfolio Assistant Demo</h1>
      <p style={{ marginTop: 8, color: "#6b7280" }}>
        Use the button below to open the assistant (loads the centered modal page).
      </p>

      <div style={{ marginTop: 28 }}>
        <a
          href={vercelEmbedUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "12px 18px",
            background: "#0f80d9",
            color: "#fff",
            borderRadius: 12,
            textDecoration: "none",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(15,128,217,0.18)"
          }}
        >
          Open Assistant (new tab)
        </a>
      </div>

      <p style={{ marginTop: 18, color: "#999", fontSize: 13 }}>
        Tip: After you finish adjusting the UI here, you can add the Framer embed that opens this modal as an overlay.
      </p>
    </main>
  );
}
