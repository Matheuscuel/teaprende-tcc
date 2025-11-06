"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BackButton({ href, onClick, className = "" }) {
  const router = useRouter();

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    } else if (!href) {
      e.preventDefault();
      router.back();
    }
  };

  const defaultClasses = `
    inline-flex items-center gap-2 
    px-4 py-2 
    text-blue-700 hover:text-blue-900 
    text-lg sm:text-xl font-semibold
    hover:bg-blue-50 
    rounded-xl 
    transition-all duration-200
    mb-4
  `;

  if (href) {
    return (
      <Link 
        href={href}
        className={`${defaultClasses} ${className}`}
        onClick={handleClick}
      >
        <span className="text-2xl">←</span>
        <span>Voltar</span>
      </Link>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`${defaultClasses} ${className}`}
    >
      <span className="text-2xl">←</span>
      <span>Voltar</span>
    </button>
  );
}

