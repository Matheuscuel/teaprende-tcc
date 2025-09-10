import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

export default function RecordSessionModal({
  isOpen,
  onClose,
  childId,
  onSessionSaved,
  onError
}) {
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!notes || !duration) {
      onError && onError("Preencha todos os campos!");
      return;
    }

    try {
      setLoading(true);
      const payload = { notes, duration: Number(duration) };
      const url = `/children/${childId}/sessions`;
      console.log("POST", url, payload);
      await api.post(url, payload);
      onSessionSaved && onSessionSaved();
      setNotes(""); setDuration("");
      onClose && onClose();
    } catch (err) {
      console.error("POST /children/:id/sessions failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Erro ao registrar sessão!";
      onError && onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center" role="dialog" aria-modal="true"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
          <motion.div className="relative bg-white p-6 rounded-2xl shadow-2xl w-96"
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}>
            <h2 className="text-xl font-bold mb-4">Registrar Sessão</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Anotações</label>
              <textarea className="w-full border p-2 rounded" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Escreva observações da sessão..." />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Duração (minutos)</label>
              <input type="number" className="w-full border p-2 rounded" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex: 45" min="1" />
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-60" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60" onClick={handleSubmit} disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
