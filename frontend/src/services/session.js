import api from "./api";

export async function startSession(childId, gameId) {
  const { data } = await api.post(`/children/${childId}/games/${gameId}/sessions/start`);
  return data;
}

export async function addEvent(sessionId, type, payload = {}) {
  const { data } = await api.post(`/game-sessions/${sessionId}/events`, { type, payload });
  return data;
}

export async function finishSession(sessionId, { outcome="completed", score=0, accuracy=0, duration_sec=0, notes="" }) {
  const { data } = await api.post(`/game-sessions/${sessionId}/finish`, {
    outcome, score, accuracy, duration_sec, notes
  });
  return data;
}

export async function getChildProgress(childId) {
  const { data } = await api.get(`/children/${childId}/games/progress`);
  return data;
}

