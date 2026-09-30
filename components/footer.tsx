import Link from "next/link";
import { getCategories } from "@/lib/data/catalog";
import { Wordmark } from "@/components/header/wordmark";

export async function Footer() {
  const categories = await getCategories();
  const half = Math.ceil(categories.length / 2);
  const columns = [
    { title: "Shop", links: categories.slice(0, half).map((c) => ({ href: `/s?cat=${c.slug}`, label: c.name })) },
    { title: "More departments", links: categories.slice(half).map((c) => ({ href: `/s?cat=${c.slug}`, label: c.name })) },
    {
      title: "Let Us Help You",
      links: [
        { href: "/orders", label: "Your Orders" },
        { href: "/cart", label: "Your Cart" },
        { href: "/signin", label: "Sign in" },
        { href: "/register", label: "Create an account" },
      ],
    },
  ];

  return (
    <footer className="mt-auto text-white">
      <a href="#top" className="block bg-footer-top py-4 text-center text-sm hover:bg-[#485769]">
        Back to top
      </a>
      <div className="bg-subnav">
        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-8 px-6 py-10 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="mb-2 font-bold">{col.title}</h2>
              <ul className="space-y-1.5 text-sm text-[#ddd]">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 border-t border-[#3a4553] bg-header py-6 text-xs text-[#ddd]">
        <Wordmark />
        <p>A portfolio project. Demo checkout only: no real payments are taken. Product data from DummyJSON.</p>
      </div>
    </footer>
  );
}
