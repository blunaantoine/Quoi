import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/posts/[id] — Get single post with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: {
          include: { profile: true },
        },
        category: true,
        comments: {
          include: {
            author: {
              include: { profile: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        likes: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
        savedBy: true,
        _count: {
          select: { likes: true, comments: true, savedBy: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment view count
    await db.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] — Update post (only by author or admin/manager)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { authorId, title, description, image, categorySlug, externalLink, whatsapp, email, phone, location, eventDate, deadlineDate, mode, status, tags } = body;

    // Check post exists
    const existingPost = await db.post.findUnique({ where: { id } });
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check authorization
    const user = await db.user.findUnique({ where: { id: authorId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (existingPost.authorId !== authorId && user.role !== "admin" && user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedPost = await db.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(categorySlug !== undefined && { categorySlug }),
        ...(externalLink !== undefined && { externalLink }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(eventDate !== undefined && { eventDate: eventDate ? new Date(eventDate) : null }),
        ...(deadlineDate !== undefined && { deadlineDate: deadlineDate ? new Date(deadlineDate) : null }),
        ...(mode !== undefined && { mode }),
        ...(status !== undefined && { status }),
        ...(tags !== undefined && { tags }),
      },
      include: {
        author: {
          include: { profile: true },
        },
        category: true,
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("PUT /api/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] — Delete post (only by author or admin/manager)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Check post exists
    const existingPost = await db.post.findUnique({ where: { id } });
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check authorization
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (existingPost.authorId !== userId && user.role !== "admin" && user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.post.delete({ where: { id } });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
