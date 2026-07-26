import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="not-found">
        <div className="closing-orbit" aria-hidden="true" />
        <p className="eyebrow">The path disappears into mist</p>
        <h1>This poem is not here.</h1>
        <p>Return to the moon and let another poem find you.</p>
        <Link className="primary-action" href="/#moods">
          Choose a mood <span aria-hidden="true">→</span>
        </Link>
      </main>
    </>
  );
}
