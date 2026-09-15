import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link to="/" className="group inline-flex items-center gap-3" aria-label="CHILLI-SHIELD home">
    <span className="grid size-10 place-items-center rounded-full bg-[#2D5016] text-[#F5F3ED] shadow-[0_6px_18px_rgba(45,80,22,.18)] transition-transform duration-200 group-hover:-rotate-6"><Leaf size={19} strokeWidth={2.4} /></span>
    {!compact && <span className="leading-none"><span className="block font-display text-[1.05rem] font-semibold tracking-[.17em] text-[#2D5016]">CHILLI</span><span className="block font-mono text-[.56rem] font-bold tracking-[.3em] text-[#B85C4D]">SHIELD</span></span>}
  </Link>;
}
