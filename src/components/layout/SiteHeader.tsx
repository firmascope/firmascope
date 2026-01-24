"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const navLinks = [
  { href: "/companies", label: "Şirketler" },
  { href: "/companies?view=submit", label: "Katkı" },
  { href: "/contact", label: "İletişim" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/">
          FirmaScope
        </Link>
        <nav className="nav-links">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || (link.href.startsWith("/companies") && pathname === "/companies");
            return (
              <Link key={link.href} className={isActive ? "active" : ""} href={link.href}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="header-actions">
          {loading ? (
            <span className="muted">Kontrol ediliyor...</span>
          ) : user ? (
            <>
              <span className="user-pill">{user.email ?? "Üye"}</span>
              <button className="btn ghost" type="button" onClick={() => void signOut()}>
                Çıkış
              </button>
            </>
          ) : (
            <Link className="btn ghost" href="/auth">
              Giriş
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
