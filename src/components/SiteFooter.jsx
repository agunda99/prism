import Wordmark from './Wordmark.jsx';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Wordmark light />
      <span>NAIROBI, KENYA <i>·</i> AFRICA &amp; EVERYWHERE</span>
      <span>© {new Date().getFullYear()} PRISM BRAND PRACTICE</span>
      <a href="#newsletter">NOTES FROM THE PRACTICE</a>
      <a href="#home" aria-label="Back to top">BACK TO TOP ↑</a>
    </footer>
  );
}
