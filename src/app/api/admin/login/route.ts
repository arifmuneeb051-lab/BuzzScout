import { NextResponse } from "next/server";

export async function POST() {
  // Admin Login API is completely severed and disabled.
  // SuperUser accesses Admin Panel exclusively via stealth session routing (#admin).
  return NextResponse.json(
    { error: "Access Denied: Terminal not found or connection severed." },
    { status: 404 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Access Denied: Terminal not found or connection severed." },
    { status: 404 }
  );
}
