import bcrypt from "bcryptjs";

const COMMON_PASSWORDS = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password1",
  "qwerty123",
  "senha123",
  "senha1234",
  "admin123",
  "letmein1",
  "iloveyou",
  "11111111",
  "00000000",
  "abc12345",
  "changeme",
  "welcome1",
  "passw0rd",
  "12341234",
]);

export function passwordProblem(password: string, email: string) {
  if (password.length < 8) return "senha";
  const normalized = password.toLowerCase();
  if (COMMON_PASSWORDS.has(normalized)) return "senha";
  if (normalized === email.toLowerCase()) return "senha";
  const local = email.split("@")[0]?.toLowerCase();
  if (local && normalized === local) return "senha";
  return null;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
