import { useEffect, useState } from "react";
import Wordmark from "./Wordmark.jsx";

const MIN_DISPLAY_MS = 5000;
const EXIT_TRANSITION_MS = 420;
const STAR_COUNT = 100;

export default function PrismLoader({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const startedAt = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let revealTimer;
    let exitTimer;
    let loadListener;
    let cancelled = false;

    document.body.classList.add("is-prism-loading");

    const documentLoaded = document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) => {
          loadListener = () => resolve();
          window.addEventListener("load", loadListener, { once: true });
        });

    const imagesLoaded = () => Promise.all(
      Array.from(document.images, (image) => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) => {
          const settle = () => {
            image.removeEventListener("load", settle);
            image.removeEventListener("error", settle);
            resolve();
          };
          image.addEventListener("load", settle, { once: true });
          image.addEventListener("error", settle, { once: true });
          if (image.loading === "lazy") image.loading = "eager";
          if (image.complete) settle();
        });
      }),
    );

    Promise.all([
      documentLoaded,
      document.fonts?.ready ?? Promise.resolve(),
    ])
      .then(imagesLoaded)
      .then(() => {
        if (cancelled) return;
        const minimumTime = reduceMotion
          ? 0
          : Math.max(0, MIN_DISPLAY_MS - (performance.now() - startedAt));
        revealTimer = window.setTimeout(() => {
          if (cancelled) return;
          setLeaving(true);
          onComplete();
          exitTimer = window.setTimeout(() => {
            if (cancelled) return;
            setVisible(false);
            document.body.classList.remove("is-prism-loading");
          }, EXIT_TRANSITION_MS);
        }, minimumTime);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(revealTimer);
      window.clearTimeout(exitTimer);
      if (loadListener) window.removeEventListener("load", loadListener);
      document.body.classList.remove("is-prism-loading");
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className={`prism-loader${leaving ? " prism-loader-leaving" : ""}`} role="status" aria-label="Prism — white light in, clear spectrum out">
      <div className="loader-stars" aria-hidden="true">
        {Array.from({ length: STAR_COUNT }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="loader-orbit" aria-hidden="true" />
      <div className="loader-center">
        <div className="loader-stage" aria-hidden="true">
          <svg viewBox="0 0 600 240" preserveAspectRatio="xMidYMid meet">
            <path className="loader-input-beam" d="M 28 120 H 365" />
            <path className="loader-prism" d="M 300 18 L 205 202 H 395 Z" />
            <path className="loader-prism-edge" d="M 300 18 L 300 120" />
            <path className="loader-ray loader-ray-coral" d="M 365 120 L 575 55" />
            <path className="loader-ray loader-ray-ochre" d="M 365 120 L 575 88" />
            <path className="loader-ray loader-ray-green" d="M 365 120 H 575" />
            <path className="loader-ray loader-ray-teal" d="M 365 120 L 575 152" />
            <path className="loader-ray loader-ray-violet" d="M 365 120 L 575 185" />
            <circle className="loader-light-point" cx="28" cy="120" r="4" />
          </svg>
        </div>

        <div className="loader-progress" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <Wordmark light />
        <p className="loader-reveal-line">
          WHITE LIGHT IN. <span>CLEAR SPECTRUM OUT.</span>
        </p>
      </div>
    </div>
  );
}
