import { NextRequest, NextResponse } from "next/server";
import admin from "@/firebase/firebaseAdmin";

const ALLOWED_ORIGIN = "http://localhost:4200"; // your Angular app origin

// Helper to create CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}


export async function OPTIONS() {
  // Handle OPTIONS preflight request
  const response = NextResponse.json(null, { status: 204 }); // No content response for preflight
  return addCorsHeaders(response);
}

export async function GET(req: NextRequest) {
  // Add CORS headers to all responses
  const token = req.headers.get("authorization")?.split("Bearer ")[1];
  if (!token) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return addCorsHeaders(res);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const snapshot = await admin.firestore().collection("todos")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    //@ts-ignore
    const todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const res = NextResponse.json(todos);
    return addCorsHeaders(res);
  } catch (err) {
    console.error(err);
    const res = NextResponse.json({ error: "Internal error" }, { status: 500 });
    return addCorsHeaders(res);
  }
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split("Bearer ")[1];
  if (!token) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return addCorsHeaders(res);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await req.json();
    const { title, description, priority, status } = body;

    const newTask = {
      title,
      description,
      priority,
      status,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin.firestore().collection("todos").add(newTask);

    const res = NextResponse.json({ id: docRef.id, ...newTask });
    return addCorsHeaders(res);
  } catch (err) {
    console.error(err);
    const res = NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    return addCorsHeaders(res);
  }
}
