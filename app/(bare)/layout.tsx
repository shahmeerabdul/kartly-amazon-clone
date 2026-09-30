export default function BareLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="flex flex-1 flex-col">
      {children}
    </main>
  );
}
