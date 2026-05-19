import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/posts/[id]/comments — Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check post exists
    const post = await db.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = await db.comment.findMany({
      where: { postId: id },
      include: {
        author: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("GET /api/posts/[id]/comments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/comments — Add comment to a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, authorId } = body;

    if (!content || !authorId) {
      return NextResponse.json(
        { error: "Missing required fields: content, authorId" },
        { status: 400 }
      );
    }

    // Check post exists
    const post = await db.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check user exists
    const user = await db.user.findUnique({ where: { id: authorId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const comment = await db.comment.create({
      data: {
        content,
        postId: id,
        authorId,
      },
      include: {
        author: {
          include: { profile: true },
        },
      },
    });

    // Create notification for post author
    if (post.authorId !== authorId) {
      await db.notification.create({
        data: {
          type: "comment",
          title: "Nouveau commentaire",
          message: `Quelqu'un a commenté votre publication "${post.title}"`,
          userId: post.authorId,
          link: `/posts/${id}`,
        },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts/[id]/comments error:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
