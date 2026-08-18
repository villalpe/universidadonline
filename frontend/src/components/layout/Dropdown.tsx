"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function Dropdown({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-100"
      >
        {title}
        <span className="text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-56 rounded-md border bg-white shadow-lg z-50">
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}
