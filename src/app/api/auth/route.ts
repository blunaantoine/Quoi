import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

// POST /api/auth — Login or Register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "register") {
      // Register
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
          _count: {
            select: {
              posts: true,
              following: true,
              followers: true,
            },
          },
        },
      });

      // Remove password from response
      const { password: _p, ...safeUser } = user;

      return NextResponse.json({ user: safeUser, token: `token_${user.id}` }, { status: 201 });
    }

    // Login (default)
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: email, password" },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    const user = await db.user.findUnique({
      where: { email },
      include: {
        profile: true,
        _count: {
          select: {
            posts: true,
            following: true,
            followers: true,
          },
        },
      },
    });

    if (!user || user.password !== hashedPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive || user.isBanned) {
      return NextResponse.json(
        { error: "Account is deactivated or banned" },
        { status: 403 }
      );
    }

    // Remove password from response
    const { password: _p, ...safeUser } = user;

    return NextResponse.json({ user: safeUser, token: `token_${user.id}` });
  } catch (error) {
    console.error("POST /api/auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
