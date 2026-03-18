import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import CommunityPost from "@/models/CommunityPost";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const post = await CommunityPost.findById(id);

    if (!post) {
      return NextResponse.json(
        { ok: false, message: "Post not found" },
        { status: 404 }
      );
    }

    const alreadySaved = post.savedBy.includes(userId);

    if (alreadySaved) {
      post.savedBy = post.savedBy.filter((id: string) => id !== userId);
    } else {
      post.savedBy.push(userId);
    }

    await post.save();

    return NextResponse.json({
      ok: true,
      savedByMe: !alreadySaved,
      saved: post.savedBy.length,
    });
  } catch (error) {
    console.error("PATCH /api/community/posts/[id]/save error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to update save" },
      { status: 500 }
    );
  }
}