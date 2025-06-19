import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let serviceAccount;
const renderSecretPath = "/etc/secrets/adminsdk.json";
const localPath = path.resolve("firebase", "adminsdk.json");

if (fs.existsSync(renderSecretPath)) {
  // On Render, secret file
  serviceAccount = JSON.parse(fs.readFileSync(renderSecretPath, "utf8"));
} else {
  // Local run
  serviceAccount = JSON.parse(fs.readFileSync(localPath, "utf8"));
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { admin, db };