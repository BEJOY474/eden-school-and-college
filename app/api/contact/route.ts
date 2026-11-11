import { NextResponse } from "next/server";
import { getContactPool } from "@/lib/database";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let values: unknown;

  try {
    values = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit a valid message." }, { status: 400 });
  }

  if (!values || typeof values !== "object") {
    return NextResponse.json({ error: "Please submit a valid message." }, { status: 400 });
  }

  const data = values as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";

  if (
    !name ||
    name.length > 120 ||
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !message ||
    message.length > 5000
  ) {
    return NextResponse.json(
      { error: "Enter a valid name, email address, and message (up to 5,000 characters)." },
      { status: 400 },
    );
  }

  try {
    await getContactPool().execute(
      "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
      [name, email, message],
    );
    return NextResponse.json({ message: "Your message has been sent." }, { status: 201 });
  } catch (error) {
    console.error("Unable to save a school contact message.", error);
    return NextResponse.json(
      { error: "Your message could not be saved right now. Please try again later." },
      { status: 500 },
    );
  }
}
