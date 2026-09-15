import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { appMeta, footerDisclaimer, navCta, navItems } from "@/data/diseases";
import { Logo } from "@/components/Logo";
import { DemoBanner } from "@/components/Disclaimer";

function NavItem({ path, label }: { path: string; label: string }) {
  return <NavLink to={path} className={({ isActive }) => `relative px-2 py-2 text-[.72rem] font-semibold uppercase tracking-[.13em] transition-colors ${isActive ? "text-[#2D5016]" : "text-[#5F665B] hover:text-[#2D5016]"}`}>
    {({ isActive }) => <><span>{label}</span>{isActive && <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-[#B85C4D]" />}</>}
  </NavLink>;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return <div className="min-h-screen bg-[#F5F3ED] text-[#263021] selection:bg-[#B85C4D]/20">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="sticky top-0 z-50 border-b border-[#2D5016]/10 bg-[#F5F3ED]/95 backdrop-blur-xl">
      <div className="container flex h-[76px] items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-3 lg:flex" aria-label="Primary navigation">
          {navItems.slice(0, 6).map(item => <NavItem key={item.path} {...item} />)}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <NavLink to="/about" className="text-[.7rem] font-semibold uppercase tracking-[.13em] text-[#5F665B] hover:text-[#2D5016]">About AI</NavLink>
          <Link to={navCta.path} className="button-primary px-4 py-2.5">{navCta.label}<span aria-hidden>↗</span></Link>
        </div>
        <button className="grid size-11 place-items-center rounded-full border border-[#2D5016]/15 text-[#2D5016] lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {open && <div className="border-t border-[#2D5016]/10 bg-[#F5F3ED] px-5 py-5 lg:hidden">
        <nav className="grid gap-1" aria-label="Mobile navigation">
          {navItems.map(item => <NavLink key={item.path} to={item.path} onClick={() => setOpen(false)} className={`border-b border-[#2D5016]/10 py-3 text-sm font-semibold uppercase tracking-[.14em] ${location.pathname === item.path ? "text-[#2D5016]" : "text-[#5F665B]"}`}>{item.label}</NavLink>)}
        </nav>
      </div>}
    </header>
    <DemoBanner />
    <main id="main-content">{children}</main>
    <footer className="border-t border-[#2D5016]/10 bg-[#E9E7DE]">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.2fr_.8fr_.8fr] md:py-16">
        <div><Logo /><p className="mt-5 max-w-sm text-sm leading-relaxed text-[#66705E]">{appMeta.description} Built around the next practical check, not a black-box verdict.</p><p className="mt-7 font-mono text-[.63rem] uppercase tracking-[.18em] text-[#7C8479]">A demo prototype · 2026</p></div>
        <div><p className="eyebrow mb-4">Explore</p><div className="grid gap-3 text-sm">{navItems.slice(1, 5).map(item => <Link key={item.path} to={item.path} className="text-[#53604F] hover:text-[#2D5016]">{item.label}</Link>)}</div></div>
        <div><p className="eyebrow mb-4">Important</p><p className="text-sm leading-relaxed text-[#66705E]">{footerDisclaimer}</p></div>
      </div>
      <div className="border-t border-[#2D5016]/10 py-4"><div className="container flex flex-col justify-between gap-2 text-[.68rem] uppercase tracking-[.12em] text-[#7C8479] md:flex-row"><span>Designed for field-first decisions</span><span>Local-only demo · No APIs exposed</span></div></div>
    </footer>
  </div>;
}
