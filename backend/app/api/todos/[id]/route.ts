import { NextRequest, NextResponse } from "next/server";
import admin from "@/firebase/firebaseAdmin";

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:4200";

// Helper to add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response);
}

// Handle PATCH request (Update todo)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Await the params before using them
  const params = await context.params;
  
  const token = req.headers.get("authorization")?.split("Bearer ")[1];
  if (!token) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return addCorsHeaders(res);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    const { title, description, priority, status } = await req.json();

    // Verify todo belongs to user
    const todoDoc = await admin.firestore().collection("todos").doc(params.id).get();

    if (!todoDoc.exists) {
      const res = NextResponse.json({ error: "Todo not found" }, { status: 404 });
      return addCorsHeaders(res);
    }

    const todoData = todoDoc.data();
    if (todoData?.userId !== userId) {
      const res = NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return addCorsHeaders(res);
    }

    // Update todo
    await admin.firestore().collection("todos").doc(params.id).update({
      title,
      description,
      priority,
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const res = NextResponse.json({ message: "Task updated successfully" });
    return addCorsHeaders(res);
  } catch (err) {
    console.error("Error updating todo:", err);
    const res = NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    return addCorsHeaders(res);
  }
}

// Handle DELETE request
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Await the params before using them
  const params = await context.params;
  
  const token = req.headers.get("authorization")?.split("Bearer ")[1];
  if (!token) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return addCorsHeaders(res);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Verify todo belongs to user
    const todoDoc = await admin.firestore().collection("todos").doc(params.id).get();

    if (!todoDoc.exists) {
      const res = NextResponse.json({ error: "Todo not found" }, { status: 404 });
      return addCorsHeaders(res);
    }

    const todoData = todoDoc.data();
    if (todoData?.userId !== userId) {
      const res = NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return addCorsHeaders(res);
    }

    // Delete todo
    await admin.firestore().collection("todos").doc(params.id).delete();

    const res = NextResponse.json({ message: "Task deleted successfully" });
    return addCorsHeaders(res);
  } catch (err) {
    console.error("Error deleting todo:", err);
    const res = NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    return addCorsHeaders(res);
  }
}