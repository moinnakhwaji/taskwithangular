
import { NextApiRequest, NextApiResponse } from "next";
import admin from "../firebase/firebaseAdmin";

export const verifyFirebaseToken = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: (user: any) => void
) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    next(decodedToken); // pass the user to the route handler
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};
