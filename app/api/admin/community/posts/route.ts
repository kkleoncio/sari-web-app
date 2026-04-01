import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import CommunityPost from "@/models/CommunityPost";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const adminUserId = searchParams.get("adminUserId") || "";
    const status = (searchParams.get("status") || "pending").trim();

    if (!adminUserId) {
      return NextResponse.json(
        { ok: false, message: "adminUserId is required" },
        { status: 400 }
      );
    }

    const admin = await User.findById(adminUserId).lean();

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const filter: Record<string, any> = {
      postType: "combo",
    };

    if (["pending", "approved", "rejected"].includes(status)) {
      filter.verificationStatus = status;
    }

    const posts = await CommunityPost.find(filter)
      .populate({
        path: "mealIds",
        select: "mealName price establishmentName category foodType image",
      })
      .sort({ createdAt: -1 })
      .lean();

    const mappedPosts = posts.map((post: any) => ({
      id: String(post._id),
      author: post.authorName,
      handle: post.authorHandle,
      tag: post.tag,
      title: post.title,
      body: post.body,
      postType: post.postType ?? "combo",
      totalCost: Number(post.totalCost ?? 0),
      allowanceType: post.allowanceType ?? "daily",
      verificationStatus: post.verificationStatus ?? "pending",
      isVerified: Boolean(post.isVerified),
      meals: (post.mealIds ?? []).map((meal: any) => ({
        id: String(meal._id),
        mealName: meal.mealName,
        price: Number(meal.price ?? 0),
        establishmentName: meal.establishmentName ?? "",
        category: meal.category ?? "",
        foodType: meal.foodType ?? "",
        image: meal.image ?? "",
      })),
      createdAt: post.createdAt,
    }));

    return NextResponse.json({
      ok: true,
      posts: mappedPosts,
    });
  } catch (error) {
    console.error("GET /api/admin/community/posts error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to load admin community posts" },
      { status: 500 }
    );
  }
}