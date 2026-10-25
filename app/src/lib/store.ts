import bcrypt from "bcryptjs";

import { sampleNGOs, sampleRequests, type NGO, type ResourceRequest } from "@/lib/sevasetu";

export type Role = "donor" | "ngo" | "reviewer" | "admin";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  ngoId?: string;
}

export interface DonationRecord {
  id: string;
  donorId: string;
  item: string;
  quantity: number;
  area: string;
  ngoId: string;
  status: string;
  createdAt: string;
}

export interface AuditEntry {
  actor: string;
  role: Role;
  action: string;
  resource: string;
  outcome: string;
  timestamp: string;
}

const seededUsers = [
  { id: "user-donor", name: "Aarav Donor", email: "donor@sevasetu.local", role: "donor", password: "donor123" },
  { id: "user-ngo", name: "Priya NGO", email: "ngo@sevasetu.local", role: "ngo", password: "ngo123" },
  { id: "user-reviewer", name: "Nitin Reviewer", email: "reviewer@sevasetu.local", role: "reviewer", password: "reviewer123" },
  { id: "user-admin", name: "Meera Admin", email: "admin@sevasetu.local", role: "admin", password: "admin123" },
] as const;

export const users: AppUser[] = seededUsers.map((user) => ({
  ...user,
  passwordHash: bcrypt.hashSync(user.password, 10),
}));

export const ngos: NGO[] = sampleNGOs.map((ngo) => ({ ...ngo }));
export const requests: ResourceRequest[] = sampleRequests.map((request) => ({ ...request }));
export const donations: DonationRecord[] = [
  {
    id: "DON-1001",
    donorId: "user-donor",
    item: "Books",
    quantity: 12,
    area: "Viman Nagar",
    ngoId: "ngo-3",
    status: "Requested",
    createdAt: "2026-10-23T09:00:00Z",
  },
];
export const auditEntries: AuditEntry[] = [
  {
    actor: "user-admin",
    role: "admin",
    action: "audit",
    resource: "allocation-1001",
    outcome: "logged",
    timestamp: "2026-10-23T09:10:00Z",
  },
];

export function recordAuditEntry(entry: AuditEntry) {
  auditEntries.push(entry);
}

export function getUserByEmail(email: string) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function verifyPassword(email: string, password: string) {
  const user = getUserByEmail(email);
  if (!user) return null;
  const valid = bcrypt.compareSync(password, user.passwordHash);
  return valid ? user : null;
}

export function getPublicUser(user: AppUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function getActiveSessionFromCookies(cookieHeader?: string | null) {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("sevasetu-session="));
  if (!match) return null;
  const rawValue = decodeURIComponent(match.replace("sevasetu-session=", ""));
  try {
    return JSON.parse(rawValue) as { userId: string; role: Role };
  } catch {
    return null;
  }
}

export function getSessionUserFromRequest(cookieHeader?: string | null) {
  const session = getActiveSessionFromCookies(cookieHeader);
  if (!session) return null;
  return users.find((user) => user.id === session.userId && user.role === session.role) ?? null;
}

export function setSessionCookie() {
  return "sevasetu-session";
}
