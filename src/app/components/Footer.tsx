// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="mt-12 border-t py-6 text-center text-xs text-zinc-500">
      &copy; {new Date().getFullYear()} muu.studio
    </footer>
  );
}
