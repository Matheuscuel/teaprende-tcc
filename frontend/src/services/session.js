import api from "./api";

export async function startSession(childId, gameId) {
  const { data } = await api.post(`/children/${childId}/games/${gameId}/sessions/start`);
  return data;
}
export async function addEvent(sessionId, type, payload = {}) {
  const { data } = await api.post(`/game-sessions/${sessionId}/events`, { type, payload });
  return data;
}
export async function finishSession(sessionId, body) {
  const { data } = await api.post(`/game-sessions/${sessionId}/finish`, body);
  return data;
}
