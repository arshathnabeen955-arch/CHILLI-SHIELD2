import { AlertTriangle, Info } from "lucide-react";
import { screeningDisclaimer } from "@/data/diseases";

export function DemoBanner({ dark = false }: { dark?: boolean }) {
  return <div className={`flex items-start gap-3 border-y px-4 py-3 text-xs font-medium tracking-wide ${dark ? "border-white/15 bg-black/15 text-[#F5F3ED]" : "border-[#B85C4D]/20 bg-[#B85C4D]/[.06] text-[#713930]"}`}>
    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#B85C4D] text-[#F5F3ED]"><AlertTriangle size={12} /></span>
    <span><strong className="font-mono tracking-[.14em]">DEMO MODE</strong><span className="mx-2 opacity-50">·</span>Simulated output only. No trained model or remote inference is connected.</span>
  </div>;
}

export function ScreeningDisclaimer({ compact = false }: { compact?: boolean }) {
  return <div className="flex gap-3 rounded-2xl border border-[#2D5016]/15 bg-[#2D5016]/[.04] p-4 text-sm leading-relaxed text-[#52604A]">
    <Info size={18} className="mt-0.5 shrink-0 text-[#2D5016]" />
    <span>{compact ? "Visual screening is a prompt to look closer, not a laboratory diagnosis." : screeningDisclaimer}</span>
  </div>;
}
