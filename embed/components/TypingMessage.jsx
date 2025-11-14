// embed/components/TypingMessage.jsx
import React, { useEffect, useRef, useState } from "react";
import "./typingMessage.css";

/**
 * TypingMessage
 * - text: full assistant text to reveal
 * - charsPerSecond: number (default 120)
 * - onComplete: callback when reveal finishes
 * - instant: boolean (shows text immediately if true)
 *
 * Accessibility:
 * - respects prefers-reduced-motion
 * - aria-live="polite" for screen readers
 */
export default function TypingMessage({
  text = "",
  charsPerSecond = 120,
  onComplete = () => {},
  instant = false
}) {
  const [display, setDisplay] = useState(instant ? text : "");
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // cleanup guard
    let mounted = true;

    // reduced motion => show immediately
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || instant) {
      setDisplay(text);
      onComplete();
      return () => { mounted = false; };
    }

    // chunking strategy: update every ~33ms
    const FRAME_MS = 33;
    const chunkSize = Math.max(1, Math.floor(charsPerSecond / (1000 / FRAME_MS)));

    // reset
    indexRef.current = 0;
    setDisplay("");

    function step() {
      if (!mounted) return;
      indexRef.current = Math.min(text.length, indexRef.current + chunkSize);
      setDisplay(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        onComplete();
      }
    }

    // start
    timerRef.current = setInterval(step, FRAME_MS);
    // first immediate step for snappy feel
    step();

    return () => {
      mounted = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [text, charsPerSecond, instant, onComplete]);

  // fast-forward on click: reveal full text immediately
  function fastForward() {
    if (display === text) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDisplay(text);
    onComplete();
  }

  return (
    <div
      className="typing-message"
      onClick={fastForward}
      role="article"
      aria-live="polite"
      aria-label="Assistant message"
    >
      <div className="typing-content">{display}</div>
      {display !== text && <span className="typing-caret" aria-hidden="true">▍</span>}
    </div>
  );
}
