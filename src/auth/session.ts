// Utilidades de sessão do usuário.
//
// O token JWT é emitido pelo plus-ms-auth e guardado em localStorage["token"] pelo
// plus-mfe-auth. O payload contém { sub, user_id, role, exp }. Aqui decodificamos
// localmente apenas para adaptar a UI (RBAC visual) — o backend continua validando
// as permissões de escrita (respondendo 403 quando necessário).

interface JwtPayload {
  sub?: string;
  user_id?: number;
  role?: string;
  exp?: number;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

// Decodifica o payload (parte do meio) do JWT sem validar a assinatura.
function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    // base64url -> base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getRole(): string | null {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token)?.role ?? null;
}

export function isAdmin(): boolean {
  return getRole() === "admin";
}

// Limpa a sessão e devolve o usuário ao login (servido pelo shell).
export function logoutRedirect(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  window.location.href = "/login";
}
