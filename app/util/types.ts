import { Timestamp } from "firebase/firestore";

export type DaisyColor =
  | "primary"
  | "primary-content"
  | "secondary"
  | "secondary-content"
  | "accent"
  | "accent-content"
  | "neutral"
  | "neutral-content"
  | "base-100"
  | "base-200"
  | "base-300"
  | "base-content"
  | "info"
  | "info-content"
  | "success"
  | "success-content"
  | "warning"
  | "warning-content"
  | "error"
  | "error-content";

export type User = {
  uid: string;
  email: string;
  username: string;
}

export type PublicUser = {
  username: string;
  uid: string;
}

export type Lobby = {
  id: string;
  name: string;
  createdBy: string;
  activeUsers: PublicUser[];
  createdAt: Timestamp;
  activityMap: Record<string, Timestamp>;
  readyMap?: Record<string, boolean>;
  lastActive: Timestamp;
};
