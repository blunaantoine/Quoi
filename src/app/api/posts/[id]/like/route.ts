import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/posts/[id]/like — Toggle like on a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Check post exists
    const post = await db.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await db.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await db.like.delete({
        where: { id: existingLike.id },
      });

      const likesCount = await db.like.count({ where: { postId: id } });

      return NextResponse.json({ liked: false, likesCount });
    } else {
      // Like
      await db.like.create({
        data: {
          postId: id,
          userId,
        },
      });

      const likesCount = await db.like.count({ where: { postId: id } });

      // Create notification for post author
      if (post.authorId !== userId) {
        await db.notification.create({
          data: {
            type: "like",
            title: "Nouveau like",
            message: `Quelqu'un a aimé votre publication "${post.title}"`,
            userId: post.authorId,
            link: `/posts/${id}`,
          },
        });
      }

      return NextResponse.json({ liked: true, likesCount });
    }
  } catch (error) {
    console.error("POST /api/posts/[id]/like error:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
