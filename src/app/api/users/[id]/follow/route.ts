import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/users/[id]/follow — Toggle follow
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { followerId } = body;

    if (!followerId) {
      return NextResponse.json({ error: "followerId is required" }, { status: 400 });
    }

    if (followerId === id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check target user exists
    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Check follower user exists
    const followerUser = await db.user.findUnique({ where: { id: followerId } });
    if (!followerUser) {
      return NextResponse.json({ error: "Follower not found" }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({
        where: { id: existingFollow.id },
      });

      return NextResponse.json({ following: false });
    } else {
      // Follow
      await db.follow.create({
        data: {
          followerId,
          followingId: id,
        },
      });

      // Create notification for the followed user
      await db.notification.create({
        data: {
          type: "follow",
          title: "Nouvel abonné",
          message: `${followerUser.username} a commencé à vous suivre`,
          userId: id,
        },
      });

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error("POST /api/users/[id]/follow error:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}
