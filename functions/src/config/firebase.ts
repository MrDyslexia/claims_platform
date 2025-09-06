import { applicationDefault, initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";

// Inicializa Firebase Admin SDK una sola vez y expone helpers comunes
initializeApp({ credential: applicationDefault() });

export const db = admin.firestore();
export const storage = admin.storage();
export { admin };

