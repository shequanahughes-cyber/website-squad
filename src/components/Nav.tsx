import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-lg text-headline">
          Web Design Squad
        </Link>
        <nav className="flex items-center gap-6 text-sm text-body">
          <Link href="/order" className="hover:text-headline">
            Order
          </Link>
          <Link href="/terms" className="hover:text-headline">
            Terms
          </Link>
          <Link href="/login" className="hover:text-headline">
            Log in
          </Link>
        </nav>
      </div>
    </header>
  );
}
