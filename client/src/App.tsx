import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteShell } from "@/components/SiteShell";
import Home from "@/pages/Home";
import Scanner from "@/pages/Scanner";
import Library from "@/pages/Library";
import DiseaseDetail from "@/pages/DiseaseDetail";
import EarlyWarning from "@/pages/EarlyWarning";
import FieldMonitor from "@/pages/FieldMonitor";
import CaseStudy from "@/pages/CaseStudy";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";

export default function App() {
  return <BrowserRouter><TooltipProvider><SiteShell><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/scanner" element={<Scanner />} />
    <Route path="/library" element={<Library />} />
    <Route path="/library/:id" element={<DiseaseDetail />} />
    <Route path="/early-warning" element={<EarlyWarning />} />
    <Route path="/field-monitor" element={<FieldMonitor />} />
    <Route path="/case-study" element={<CaseStudy />} />
    <Route path="/about" element={<About />} />
    <Route path="/404" element={<NotFound />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes></SiteShell></TooltipProvider></BrowserRouter>;
}
