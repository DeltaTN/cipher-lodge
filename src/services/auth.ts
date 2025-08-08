import api from "./axios";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  login: string;
  createdAt: string;
}

export async function login(username: string, password: string): Promise<{ token: string; user: AuthUser }>{
  const { data } = await api.get<any[]>("/mock/users.json");
  const found = data.find((u) => u.login === username && u.password === password);
  if (!found) {
    throw new Error("Identifiants invalides");
  }
  const token = `mock-jwt-token.${btoa(`${found.id}:${Date.now()}`)}`;
  const user: AuthUser = {
    id: found.id,
    firstName: found.firstName,
    lastName: found.lastName,
    login: found.login,
    createdAt: found.createdAt,
  };
  return { token, user };
}
