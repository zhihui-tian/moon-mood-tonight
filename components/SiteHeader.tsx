import Link from "next/link";

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  return (
    <header className={`site-header ${transparent ? "site-header-transparent" : ""}`}>
      <Link className="wordmark" href="/">
        <span className="wordmark-moon" aria-hidden="true" />
        Moon Mood Tonight
      </Link>
      <nav className="primary-nav" aria-label="Primary navigation">
        <Link href="/#moods">Choose a mood</Link>
        <Link href="/explore">Explore</Link>
        <Link href="/about">About</Link>
      </nav>
      <details className="mobile-nav">
        <summary>Menu</summary>
        <nav aria-label="Mobile navigation">
          <Link href="/#moods">Choose a mood</Link>
          <Link href="/explore">Explore all poems</Link>
          <Link href="/about">About the collection</Link>
        </nav>
      </details>
    </header>
  );
}
