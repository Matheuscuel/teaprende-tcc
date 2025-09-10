import React from "react";

export default function Toast({ open, message, type = "success", onClose }) {
  if (!open) return null;

  const color =
    type === "success" ? "bg-green-600" :
    type === "error" ? "bg-red-600" :
    "bg-gray-800";

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[10000]">
      <div className={`${color} text-white px-4 py-2 rounded-xl shadow-lg min-w-60 flex items-center gap-3`}>
        <span className="font-medium">{message}</span>
        <button
          className="ml-2 px-2 py-1 rounded bg-black/20 hover:bg-black/30 transition"
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
