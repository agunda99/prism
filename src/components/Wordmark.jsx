export default function Wordmark({ light = false }) {
  return (
    <a className={`wordmark${light ? ' wordmark-light' : ''}`} href="#home" aria-label="Prism home">
      PR<span className="wordmark-i">I</span>SM<span className="wordmark-period">.</span>
    </a>
  );
}
