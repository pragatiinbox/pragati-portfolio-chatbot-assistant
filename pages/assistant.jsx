// pages/assistant.jsx
import Head from "next/head";
import ChatAssistant from "../components/ChatAssistant"; // adjust path if needed

export default function AssistantPage() {
  return (
    <>
      <Head>
        <title>Pragati — Assistant</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>

      {/* Full-screen container so the assistant looks like a standalone page */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#fbfeff"
      }}>
        <ChatAssistant />
      </div>
    </>
  );
}
