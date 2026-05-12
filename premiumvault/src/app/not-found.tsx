import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] text-white">
      <h1 className="mb-4 text-6xl font-bold">404</h1>
      <p className="mb-8 text-xl text-gray-400">Page not found</p>
      <Link
        href="/"
        className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
      >
        Go back home
      </Link>
    </div>
  );
}
