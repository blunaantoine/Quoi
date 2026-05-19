import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/users/[id] — Get user profile with stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      include: {
        profile: true,
        _count: {
          select: {
            posts: true,
            following: true,
            followers: true,
            comments: true,
            likes: true,
            savedPosts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove password from response
    const { password: _p, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] — Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      displayName,
      bio,
      avatar,
      coverPhoto,
      phone,
      whatsapp,
      country,
      city,
      website,
      email,
      username,
      role,
      isVerified,
      isActive,
      isBanned,
    } = body;

    // Check user exists
    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user fields
    const userData: Record<string, unknown> = {};
    if (email !== undefined) userData.email = email;
    if (username !== undefined) userData.username = username;
    if (role !== undefined) userData.role = role;
    if (isVerified !== undefined) userData.isVerified = isVerified;
    if (isActive !== undefined) userData.isActive = isActive;
    if (isBanned !== undefined) userData.isBanned = isBanned;

    // Update profile fields
    const profileData: Record<string, unknown> = {};
    if (displayName !== undefined) profileData.displayName = displayName;
    if (bio !== undefined) profileData.bio = bio;
    if (avatar !== undefined) profileData.avatar = avatar;
    if (coverPhoto !== undefined) profileData.coverPhoto = coverPhoto;
    if (phone !== undefined) profileData.phone = phone;
    if (whatsapp !== undefined) profileData.whatsapp = whatsapp;
    if (country !== undefined) profileData.country = country;
    if (city !== undefined) profileData.city = city;
    if (website !== undefined) profileData.website = website;

    const user = await db.user.update({
      where: { id },
      data: {
        ...Object.keys(userData).length > 0 && userData,
        profile: Object.keys(profileData).length > 0
          ? { update: profileData }
          : undefined,
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

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
