import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import CommunityPost from "@/models/CommunityPost";
import User from "@/models/User";
import Meal from "@/models/Meal";

function normalizeObjectId(value: unknown) {
  return String(value ?? "");
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const q = (searchParams.get("q") || "").trim();
    const tag = (searchParams.get("tag") || "").trim();
    const view = (searchParams.get("view") || "all").trim(); // all | verified | mine | saved

    const filter: Record<string, any> = {};

    if (tag && tag !== "All") {
      filter.tag = tag;
    }

    if (view === "mine" && userId) {
      filter.userId = userId;
    }

    if (view === "saved" && userId) {
      filter.savedBy = userId;
    }

    if (view === "verified") {
      filter.postType = "combo";
      filter.verificationStatus = "approved";
      filter.isVerified = true;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { body: { $regex: q, $options: "i" } },
        { authorName: { $regex: q, $options: "i" } },
        { tag: { $regex: q, $options: "i" } },
      ];
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
      postType: post.postType ?? "tip",
      totalCost: Number(post.totalCost ?? 0),
      allowanceType: post.allowanceType ?? "daily",
      verificationStatus: post.verificationStatus ?? "none",
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
      likes: post.likedBy?.length ?? 0,
      comments: post.comments?.length ?? 0,
      saved: post.savedBy?.length ?? 0,
      likedByMe: userId ? (post.likedBy ?? []).includes(userId) : false,
      savedByMe: userId ? (post.savedBy ?? []).includes(userId) : false,
      isMine: userId
        ? normalizeObjectId(post.userId) === normalizeObjectId(userId)
        : false,
      createdAt: post.createdAt,
      commentsList: (post.comments ?? []).map((comment: any) => ({
        id: String(comment._id),
        author: comment.authorName,
        handle: comment.authorHandle,
        body: comment.body,
        createdAt: comment.createdAt,
      })),
    }));

    return NextResponse.json({
      ok: true,
      posts: mappedPosts,
    });
  } catch (error) {
    console.error("GET /api/community/posts error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to load posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const {
      userId,
      tag,
      title,
      body,
      postType = "tip",
      mealIds = [],
      allowanceType = "daily",
    } = await req.json();

    if (!userId || !tag || !title || !body) {
      return NextResponse.json(
        { ok: false, message: "userId, tag, title, and body are required" },
        { status: 400 }
      );
    }

    const trimmedTitle = String(title).trim();
    const trimmedBody = String(body).trim();

    if (!trimmedTitle || !trimmedBody) {
      return NextResponse.json(
        { ok: false, message: "Title and body cannot be empty" },
        { status: 400 }
      );
    }

    const finalPostType = postType === "combo" ? "combo" : "tip";

    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 }
      );
    }

    const firstName = user?.firstName?.trim() || "SARI Student";
    const lastInitial = user?.lastName?.trim()?.charAt(0) || "";
    const authorName = lastInitial ? `${firstName} ${lastInitial}.` : firstName;

    const handleBase = firstName.toLowerCase().replace(/\s+/g, "");
    const authorHandle = `@${handleBase || "student"}`;

    let selectedMeals: any[] = [];
    let totalCost = 0;

    if (finalPostType === "combo") {
      if (!Array.isArray(mealIds) || mealIds.length === 0) {
        return NextResponse.json(
          { ok: false, message: "Please select at least one meal for a combo" },
          { status: 400 }
        );
      }

      selectedMeals = await Meal.find({
        _id: { $in: mealIds },
        isAvailable: { $ne: false },
      })
        .select("mealName price establishmentName category foodType image")
        .lean();

      if (!selectedMeals.length) {
        return NextResponse.json(
          { ok: false, message: "Selected meals could not be found" },
          { status: 400 }
        );
      }

      totalCost = selectedMeals.reduce(
        (sum, meal: any) => sum + Number(meal.price ?? 0),
        0
      );
    }

    const post = await CommunityPost.create({
      userId,
      authorName,
      authorHandle,
      tag,
      title: trimmedTitle,
      body: trimmedBody,
      postType: finalPostType,
      mealIds: finalPostType === "combo" ? selectedMeals.map((meal) => meal._id) : [],
      totalCost,
      allowanceType: allowanceType === "weekly" ? "weekly" : "daily",
      verificationStatus: finalPostType === "combo" ? "pending" : "none",
      isVerified: false,
    });

    return NextResponse.json({
      ok: true,
      message:
        finalPostType === "combo"
          ? "Meal combo submitted for verification"
          : "Post created successfully",
      post: {
        id: String(post._id),
        author: post.authorName,
        handle: post.authorHandle,
        tag: post.tag,
        title: post.title,
        body: post.body,
        postType: post.postType,
        totalCost,
        allowanceType: post.allowanceType,
        verificationStatus: post.verificationStatus,
        isVerified: post.isVerified,
        meals: selectedMeals.map((meal: any) => ({
          id: String(meal._id),
          mealName: meal.mealName,
          price: Number(meal.price ?? 0),
          establishmentName: meal.establishmentName ?? "",
          category: meal.category ?? "",
          foodType: meal.foodType ?? "",
          image: meal.image ?? "",
        })),
        likes: 0,
        comments: 0,
        saved: 0,
        likedByMe: false,
        savedByMe: false,
        isMine: true,
        createdAt: post.createdAt,
        commentsList: [],
      },
    });
  } catch (error) {
    console.error("POST /api/community/posts error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to create post" },
      { status: 500 }
    );
  }
}