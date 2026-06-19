/**
 * SubAppLayout — Wrapper for sub-app pages
 * Provides a sticky header with back button + sub-app title
 */
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface SubAppLayoutProps {
  title: string;
  backTo: string;
  children: React.ReactNode;
}

export default function SubAppLayout({
  title,
  backTo,
  children,
}: SubAppLayoutProps) {
  const [, navigate] = useLocation();

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(backTo)}
          className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
          aria-label="กลับ"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      {children}
    </>
  );
}
