import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-mark">Moon Mood Tonight</p>
        <p>Classical Chinese poetry for the way you feel tonight.</p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/#moods">Choose a mood</Link>
        <Link href="/explore">Explore</Link>
        <Link href="/about">About</Link>
      </nav>
      <p className="footer-license">
        Translations and visual interpretations · CC BY 4.0
      </p>
    </footer>
  );
}
