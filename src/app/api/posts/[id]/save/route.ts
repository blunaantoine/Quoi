import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/posts/[id]/save — Toggle save on a post
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

    // Check if already saved
    const existingSave = await db.savedPost.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId,
        },
      },
    });

    if (existingSave) {
      // Unsave
      await db.savedPost.delete({
        where: { id: existingSave.id },
      });

      return NextResponse.json({ saved: false });
    } else {
      // Save
      await db.savedPost.create({
        data: {
          postId: id,
          userId,
        },
      });

      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error("POST /api/posts/[id]/save error:", error);
    return NextResponse.json(
      { error: "Failed to toggle save" },
      { status: 500 }
    );
  }
}
