import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
export default function NotFound(){return <div className="container py-28"><p className="eyebrow">404 / not found</p><h1 className="display-lg mt-5 text-[#2D5016]">This row is empty.</h1><p className="mt-5 max-w-md text-[#66705E]">The page you’re looking for is not part of the current field map.</p><Link to="/" className="button-primary mt-8 px-5 py-3"><ArrowLeft size={15}/> Back home</Link></div>}
