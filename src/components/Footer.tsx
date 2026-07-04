import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Web Design Squad — custom websites, built by hand.</p>
        <div className="flex gap-5">
          <Link href="/order" className="hover:text-headline">
            Order
          </Link>
          <Link href="/terms" className="hover:text-headline">
            Terms
          </Link>
          <Link href="/login" className="hover:text-headline">
            Log in
          </Link>
        </div>
      </div>
    </footer>
  );
}
