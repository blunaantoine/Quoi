import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

// GET /api/users — Search users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    const where: Record<string, unknown> = {};
    if (q) {
      where.OR = [
        { username: { contains: q } },
        { email: { contains: q } },
        { profile: { displayName: { contains: q } } },
      ];
    }

    const users = await db.user.findMany({
      where,
      include: {
        profile: true,
        _count: {
          select: { posts: true, following: true, followers: true },
        },
      },
      take: 20,
    });

    // Remove passwords from response
    const safeUsers = users.map(({ password: _p, ...user }) => user);

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}

// POST /api/users — Register user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, displayName } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields: email, username, password" },
        { status: 400 }
      );
    }

    // Check if email or username already taken
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or username already taken" },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        profile: {
          create: {
            displayName: displayName || username,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Remove password from response
    const { password: _p, ...safeUser } = user;

    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
