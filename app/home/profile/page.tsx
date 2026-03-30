"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ArrowLeft,
  Mail,
  MapPin,
  PencilLine,
  LogOut,
  FileText,
  Bookmark,
  WalletCards,
  Sparkles,
  Store,
  ChartNoAxesCombined,
  CheckCircle2,
  Clock3,
  UtensilsCrossed,
  Flame,
  Leaf,
  Coffee,
  Soup,
  Drumstick,
  BadgePercent,
  Heart,
  ChevronRight,
  Salad,
  NotebookPen,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { useRouter } from "next/navigation";
import { LogoutConfirmationModal } from "@/components/home/modals/logout-confirmation-modal";

type ProfileData = {
  name: string;
  username: string;
  email: string;
  location: string;
  bio: string;
  budgetStyle: string;
  favoriteFood: string;
  mealsSaved: number;
  plansGenerated: number;
  establishmentsExplored: number;
  joinedLabel: string;
};

type UserPost = {
  id: string;
  author: string;
  handle: string;
  tag: string;
  title: string;
  body: string;
  likes: number;
  comments: number;
  saved: number;
  likedByMe: boolean;
  savedByMe: boolean;
  isMine: boolean;
  createdAt: string;
};

type Meal = {
  _id?: string;
  mealName: string;
  establishmentName?: string;
  price?: number;
};

type HistoryItem = {
  id?: string;
  label?: string;
  totalCost?: number;
  createdAt?: string;
  date?: string;
  meals?: Meal[];
};

const FOOD_PERSONALITY_OPTIONS = [
  "Tipid meals",
  "Budget-conscious",
  "Sulit finder",
  "Less fried",
  "High protein",
  "Vegetable picks",
  "Comfort food",
  "Study snacker",
];

const FAVORITE_FOOD_OPTIONS = [
  "Rice meals",
  "Silog",
  "Snacks",
  "Soup",
  "Chicken",
  "Street food",
  "Vegetables",
  "Takoyaki",
];



function formatRelativeTime(dateString: string) {
  const timestamp = new Date(dateString).getTime();
  const diff = Date.now() - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (Number.isNaN(timestamp)) return "Recently";
  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 2 * day) return "Yesterday";
  return `${Math.floor(diff / day)}d ago`;
}

function formatPeso(value?: number) {
  return typeof value === "number" ? `₱${value}` : "—";
}

function getInitials(name: string) {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function parsePreferenceString(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyPreferenceArray(values: string[]) {
  return values.join(", ");
}

function getTopEstablishments(meals: Meal[]) {
  const counts = new Map<string, number>();

  meals.forEach((meal) => {
    if (!meal.establishmentName) return;
    counts.set(
      meal.establishmentName,
      (counts.get(meal.establishmentName) || 0) + 1
    );
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));
}

function getAverageSavedMealPrice(meals: Meal[]) {
  const valid = meals.filter((meal) => typeof meal.price === "number");
  if (!valid.length) return 0;
  const total = valid.reduce((sum, meal) => sum + Number(meal.price || 0), 0);
  return Math.round(total / valid.length);
}

function getProfileCompletion(
  profile: ProfileData,
  savedMeals: Meal[],
  posts: UserPost[]
) {
  const checks = [
    Boolean(profile.name?.trim()),
    Boolean(profile.email?.trim()),
    Boolean(profile.location?.trim()),
    Boolean(profile.bio?.trim()),
    Boolean(profile.budgetStyle?.trim()),
    Boolean(profile.favoriteFood?.trim()),
    savedMeals.length > 0,
    posts.length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function getRecentActivity(
  posts: UserPost[],
  historyItems: HistoryItem[],
  savedMeals: Meal[]
) {
  const items: { label: string; time: string; icon: React.ReactNode }[] = [];

  if (posts.length > 0) {
    items.push({
      label: `Posted "${posts[0].title}"`,
      time: formatRelativeTime(posts[0].createdAt),
     icon: <NotebookPen className="h-[35px] w-[15px]" strokeWidth={2} />,
    });
  }

  if (historyItems.length > 0) {
    items.push({
      label: `Generated ${historyItems[0].label || "a meal plan"}`,
      time: historyItems[0].createdAt
        ? formatRelativeTime(historyItems[0].createdAt)
        : "Recently",
      icon: <CalendarClock className="h-4 w-4" />,
    });
  }

  if (savedMeals.length > 0) {
    items.push({
      label: `Saved ${savedMeals[0].mealName}`,
      time: "Recently",
      icon: <Bookmark className="h-4 w-4" />,
    });
  }

  return items.slice(0, 3);
}

function getVibeBadges(
  selectedBudgetStyles: string[],
  selectedFavoriteFoods: string[]
) {
  const pool = [...selectedBudgetStyles, ...selectedFavoriteFoods].slice(0, 4);

  return pool.map((item) => {
    const lower = item.toLowerCase();

    if (lower.includes("fried")) {
      return { label: item, icon: <Flame className="h-4 w-4" /> };
    }
    if (lower.includes("vegetable")) {
      return { label: item, icon: <Leaf className="h-4 w-4" /> };
    }
    if (lower.includes("snack")) {
      return { label: item, icon: <Coffee className="h-4 w-4" /> };
    }
    if (lower.includes("soup")) {
      return { label: item, icon: <Soup className="h-4 w-4" /> };
    }
    if (lower.includes("chicken")) {
      return { label: item, icon: <Drumstick className="h-4 w-4" /> };
    }
    if (lower.includes("budget") || lower.includes("tipid") || lower.includes("sulit")) {
      return { label: item, icon: <BadgePercent className="h-4 w-4" /> };
    }

    return { label: item, icon: <UtensilsCrossed className="h-4 w-4" /> };
  });
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
const userId = session?.user?.id ?? "";
  const [editOpen, setEditOpen] = React.useState(false);
  const [loadingPosts, setLoadingPosts] = React.useState(true);
  const [loadingHistory, setLoadingHistory] = React.useState(true);
  const [loadingSaved, setLoadingSaved] = React.useState(true);
  const [userPosts, setUserPosts] = React.useState<UserPost[]>([]);
  const [historyItems, setHistoryItems] = React.useState<HistoryItem[]>([]);
  const [savedMeals, setSavedMeals] = React.useState<Meal[]>([]);
  const [activeTab, setActiveTab] = React.useState<"posts" | "history" >("posts");
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [profile, setProfile] = React.useState<ProfileData>({
    name: "",
    username: "",
    email: "",
    location: "",
    bio: "",
    budgetStyle: "",
    favoriteFood: "",
    mealsSaved: 0,
    plansGenerated: 0,
    establishmentsExplored: 0,
    joinedLabel: "",
  });

  const [formData, setFormData] = React.useState({
    name: "",
    username: "",
    email: "",
    location: "",
    bio: "",
    budgetStyle: "",
    favoriteFood: "",
  });


  React.useEffect(() => {
    async function loadProfile() {
      if (typeof window === "undefined") return;

      if (!userId) return;

      const savedProfileRaw = localStorage.getItem(`sariProfile:${userId}`);
      const manualMealsRaw = localStorage.getItem("manualMealPlan") || "[]";

      const manualMeals: Meal[] = JSON.parse(manualMealsRaw);

      setSavedMeals(manualMeals);
      setLoadingSaved(false);

      const uniqueEstablishments = new Set(
        manualMeals.map((meal) => meal.establishmentName).filter(Boolean)
      );

      let dbFirstName = "";
      let dbLastName = "";
      let dbEmail = "";

      try {
        const res = await fetch(`/api/users/${userId}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (res.ok && data?.user) {
          dbFirstName = data.user.firstName || "";
          dbLastName = data.user.lastName || "";
          dbEmail = data.user.email || "";

          localStorage.setItem("firstName", dbFirstName);
          localStorage.setItem("userEmail", dbEmail);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }

      const fullName = [dbFirstName, dbLastName].filter(Boolean).join(" ").trim();

      const defaultProfile: ProfileData = {
        name: fullName || dbFirstName || "SARI User",
        username: dbFirstName ? `@${dbFirstName.toLowerCase()}` : "@sariuser",
        email: dbEmail,
        location: "Los Baños, Laguna",
        bio: "",
        budgetStyle: "",
        favoriteFood: "",
        mealsSaved: manualMeals.length,
        plansGenerated: 0,
        establishmentsExplored: uniqueEstablishments.size,
        joinedLabel: "Joined SARI",
      };

      if (savedProfileRaw) {
        const savedProfile = JSON.parse(savedProfileRaw);

        const mergedProfile: ProfileData = {
          ...defaultProfile,
          ...savedProfile,
          name: savedProfile.name || defaultProfile.name,
          email: savedProfile.email || defaultProfile.email,
          mealsSaved: manualMeals.length,
          establishmentsExplored: uniqueEstablishments.size,
        };

        setProfile(mergedProfile);
        setFormData({
          name: mergedProfile.name,
          username: mergedProfile.username,
          email: mergedProfile.email,
          location: mergedProfile.location,
          bio: mergedProfile.bio,
          budgetStyle: mergedProfile.budgetStyle,
          favoriteFood: mergedProfile.favoriteFood,
        });
      } else {
        setProfile(defaultProfile);
        setFormData({
          name: defaultProfile.name,
          username: defaultProfile.username,
          email: defaultProfile.email,
          location: defaultProfile.location,
          bio: defaultProfile.bio,
          budgetStyle: defaultProfile.budgetStyle,
          favoriteFood: defaultProfile.favoriteFood,
        });
      }
    }

    loadProfile();
  }, [userId]);

  React.useEffect(() => {
    async function loadMyPosts() {
      if (!userId) {
        setUserPosts([]);
        setLoadingPosts(false);
        return;
      }

      try {
        setLoadingPosts(true);

        const params = new URLSearchParams();
        params.set("userId", userId);
        params.set("view", "mine");

        const res = await fetch(`/api/community/posts?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load posts");
        }

        setUserPosts(data.posts ?? []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load your posts", {
          description: "Please try refreshing the page.",
        });
      } finally {
        setLoadingPosts(false);
      }
    }

    loadMyPosts();
  }, [userId]);

  React.useEffect(() => {
    async function loadHistoryPreview() {
      if (typeof window === "undefined") return;

      if (!userId) {
        setHistoryItems([]);
        setLoadingHistory(false);
        return;
      }

      try {
        setLoadingHistory(true);

        const res = await fetch(
          `/api/mealplans/history?userId=${encodeURIComponent(userId)}`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (data.ok && Array.isArray(data.history)) {
          const mapped: HistoryItem[] = data.history.map((item: any) => ({
            id: String(item._id),
            label: item.label || "Saved Meal Plan",
            createdAt: item.createdAt,
            totalCost: Number(item.totalCost ?? 0),
            meals: (item.meals ?? []).map((meal: any) => ({
              _id: meal._id,
              mealName: meal.mealName,
              price: Number(meal.price ?? 0),
              establishmentName: meal.establishmentName,
            })),
          }));

          setHistoryItems(mapped);

          setProfile((prev) => ({
            ...prev,
            plansGenerated: mapped.length,
          }));
        } else {
          setHistoryItems([]);
          setProfile((prev) => ({
            ...prev,
            plansGenerated: 0,
          }));
        }
      } catch (error) {
        console.error("Failed to load history preview:", error);
        setHistoryItems([]);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistoryPreview();
  }, [userId]);

  function persistProfile(updatedProfile: ProfileData) {
    setProfile(updatedProfile);
    localStorage.setItem(`sariProfile:${userId}`, JSON.stringify(updatedProfile));
    localStorage.setItem(
      "firstName",
      updatedProfile.name.trim().split(" ")[0] || updatedProfile.name
    );
    localStorage.setItem("userEmail", updatedProfile.email);
  }

  function openEditModal() {
    setFormData({
      name: profile.name,
      username: profile.username,
      email: profile.email,
      location: profile.location,
      bio: profile.bio,
      budgetStyle: profile.budgetStyle,
      favoriteFood: profile.favoriteFood,
    });
    setEditOpen(true);
  }

  function handleFieldChange(
    field:
      | "name"
      | "username"
      | "email"
      | "location"
      | "bio"
      | "budgetStyle"
      | "favoriteFood",
    value: string
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSaveProfile() {
    const updatedProfile: ProfileData = {
      ...profile,
      ...formData,
    };

    persistProfile(updatedProfile);
    setEditOpen(false);

    toast.success("Profile updated", {
      description: "Your SARI profile has been saved.",
      className:
        "border border-[#0b6b57]/20 bg-[#EAF8F4] text-[#023030] [&_[data-title]]:!text-[#0b6b57] [&_[data-description]]:!text-[#023030]/80 [&_[data-description]]:!opacity-100",
      classNames: {
        title: "!text-[#0b6b57] font-semibold",
        description: "!text-[#023030]/80 text-sm !opacity-100",
      },
    });
  }

 async function handleLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("manualMealPlan");
    localStorage.removeItem("currentPlanSource");
    localStorage.removeItem("currentBudget");
    localStorage.removeItem("firstName");
    localStorage.removeItem("userEmail");
  }

  setLogoutOpen(false);

  await signOut({ redirectTo: "/auth/login" });
}
  function togglePreference(field: "budgetStyle" | "favoriteFood", value: string) {
    const currentValues = parsePreferenceString(profile[field]);
    const exists = currentValues.includes(value);

    const nextValues = exists
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    const updatedProfile: ProfileData = {
      ...profile,
      [field]: stringifyPreferenceArray(nextValues),
    };

    const updatedFormData = {
      ...formData,
      [field]: stringifyPreferenceArray(nextValues),
    };

    setFormData(updatedFormData);
    persistProfile(updatedProfile);

    toast.success(exists ? "Preference removed" : "Preference added", {
      description: exists
        ? `${value} was removed from your profile.`
        : `${value} was added to your profile.`,
      className:
        "border border-[#0b6b57]/20 bg-[#EAF8F4] text-[#023030] [&_[data-title]]:!text-[#0b6b57] [&_[data-description]]:!text-[#023030]/80 [&_[data-description]]:!opacity-100",
      classNames: {
        title: "!text-[#0b6b57] font-semibold",
        description: "!text-[#023030]/80 text-sm !opacity-100",
      },
    });
  }

  const completion = getProfileCompletion(profile, savedMeals, userPosts);
  const recentActivity = getRecentActivity(userPosts, historyItems, savedMeals);
  const historyMeals = historyItems.flatMap((item) => item.meals || []);

  const insightMeals =
    savedMeals.length > 0 ? savedMeals : historyMeals;

  const topEstablishments = getTopEstablishments(insightMeals);
  const avgSavedMealPrice = getAverageSavedMealPrice(insightMeals);

  const stats = [
    {
      label: "Posts",
      value: userPosts.length,
      icon: <FileText className="h-4 w-4 text-[#023030]" />,
    },
    {
      label: "Saved",
      value: insightMeals.length,
      icon: <Bookmark className="h-4 w-4 text-[#023030]" />,
    },
    {
      label: "Plans",
      value: profile.plansGenerated,
      icon: <WalletCards className="h-4 w-4 text-[#023030]" />,
    },
  ];

  if (status === "loading") {
  return (
    <main className="min-h-screen px-4 py-5 text-[#1f2937] md:px-7">
      <div className="mx-auto max-w-6xl">
        <p className="font-poppins text-sm">Loading profile...</p>
      </div>
    </main>
  );
}

  return (
    <>
      <main
        className="min-h-screen px-4 py-5 text-[#1f2937] md:px-7"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(16,185,129,0.10) 0%, rgba(16,185,129,0) 26%), radial-gradient(circle at top left, rgba(45,212,191,0.10) 0%, rgba(45,212,191,0) 24%), linear-gradient(180deg, #f8fffd 0%, #edf7f3 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Link href="/home">
              <Button
                variant="outline"
                className="rounded-2xl border-[#cfe8df] bg-white/80 text-[#134e4a] backdrop-blur-md hover:bg-[#f8fffd]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => setLogoutOpen(true)}
              className="rounded-2xl border-[#cfe8df] bg-white/80 px-5 text-[#134e4a] hover:bg-[#f8fffd]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>

          <section className="overflow-hidden rounded-[34px] border border-[#dcefe8] bg-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
            <div className="relative h-[160px] w-full overflow-hidden border-b border-white/40 bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] md:h-[190px]">
              {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_22%)]" /> */}
              <div className="absolute -left-10 top-4 h-32 w-32 rounded-full bg-[#d1fae5]/10 blur-3xl" />
              <div className="absolute right-10 top-2 h-28 w-28 rounded-full bg-[#99f6e4]/40 blur-3xl" />
            </div>

            <div className="relative px-5 pb-6 md:px-8 md:pb-8">
              <div className="relative -mt-14 md:-mt-16">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
                  <div className="flex items-start gap-4">
                    <div className="relative h-28 w-28 shrink-0 rounded-full border-[6px] border-white bg-[linear-gradient(135deg,#d1fae5,#a7f3d0,#ecfdf5)] shadow-[0_14px_40px_rgba(15,23,42,0.10)] md:h-32 md:w-32">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-white/30 backdrop-blur-md">
                        <span className="font-poppins text-3xl font-semibold text-[#1f2937]">
                          {getInitials(profile.name || "SARI User")}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 pt-2 md:pt-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-poppins text-[28px] font-semibold leading-tight tracking-tight text-[#FAFAFA] md:text-[36px]">
                          {profile.name || "SARI User"}
                        </h1>

                        <Button
                          type="button"
                          size="icon"
                          onClick={openEditModal}
                          className="h-9 w-9 rounded-full bg-transparent text-white hover:bg-white/70"
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-2 flex flex-col gap-2 text-sm text-[#374151]/78">
                        <HeaderMetaRow
                          icon={<MapPin className="h-4 w-4 text-[#023030]" />}
                          text={profile.location || "Los Baños, Laguna"}
                        />
                        <HeaderMetaRow
                          icon={<Mail className="h-4 w-4 text-[#023030]" />}
                          text={profile.email || "No email yet"}
                        />
                      </div>

                      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4b5563]">
                        {profile.bio ||
                          "Budgeting meals, saving favorites, and planning around campus with SARI."}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-[#dcefe8] bg-white/72 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
                    <div className="grid grid-cols-3 gap-3">
                      {stats.map((stat) => (
                        <ProfileStatBubble
                          key={stat.label}
                          label={stat.label}
                          value={stat.value}
                          icon={stat.icon}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] border border-[#dcefe8] bg-white/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#0f766e]" />
                        <p className="font-poppins text-sm font-semibold text-[#111827]">
                          Your SARI profile
                        </p>
                      </div>

                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#e7f5ef]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] transition-all"
                          style={{ width: `${completion}%` }}
                        />
                      </div>

                      <div className="mt-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#134e4a]">
                            {completion}% complete
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#4b635d]">
                            Complete your bio, preferences, and activity to build your profile.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[#ecfdf5] p-2 text-[#0f766e]">
                          <Heart className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-[#dcefe8] bg-white/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                      <div className="flex items-center gap-2">
                        <ChartNoAxesCombined className="h-4 w-4 text-[#0f766e]" />
                        <p className="font-poppins text-sm font-semibold text-[#111827]">
                          Your food vibe
                        </p>
                      </div>

                      <div className="mt-3 grid gap-2">
                        <InsightRow
                          icon={<Bookmark className="h-4 w-4" />}
                          label="Saved meals"
                          value={`${insightMeals.length} total`}
                        />
                        <InsightRow
                          icon={<BadgePercent className="h-4 w-4" />}
                          label="Average meal"
                          value={avgSavedMealPrice ? `₱${avgSavedMealPrice}` : "—"}
                        />
                        <InsightRow
                          icon={<Store className="h-4 w-4" />}
                          label="Top spot"
                          value={topEstablishments[0]?.name || "No data yet"}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[#dcefe8] bg-white/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-[#0f766e]" />
                        <p className="font-poppins text-sm font-semibold text-[#111827]">
                          Recent activity
                        </p>
                      </div>

                      <span className="rounded-full bg-[#f3fbf8] px-2.5 py-1 text-[11px] font-medium text-[#0f766e]">
                        Latest
                      </span>
                    </div>

                    <div className="mt-3 space-y-3">
                      {recentActivity.length === 0 ? (
                        <div className="rounded-[18px] border border-dashed border-[#cfe8df] bg-[#f8fffd] px-4 py-4">
                          <div className="flex items-center gap-2 text-[#134e4a]">
                            <Sparkles className="h-4 w-4" />
                            <p className="text-sm font-medium">
                              Your activity is still quiet
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-[#6b7280]">
                            Save meals, make plans, or post in the community to fill this up.
                          </p>
                        </div>
                      ) : (
                        recentActivity.map((item, index) => (
                          <TimelineItem
                            key={`${item.label}-${index}`}
                            icon={item.icon}
                            label={item.label}
                            time={item.time}
                            last={index === recentActivity.length - 1}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-b border-[#d1d5db]/70">
                <div className="flex flex-wrap items-center gap-6">
                  <ProfileTabButton
                    label="Posts"
                    active={activeTab === "posts"}
                    icon={<NotebookPen className="h-4 w-4" />}
                    onClick={() => setActiveTab("posts")}
                  />
                  <ProfileTabButton
                    label="History"
                    active={activeTab === "history"}
                    icon={<CalendarClock className="h-4 w-4" />}
                    onClick={() => setActiveTab("history")}
                  />
                </div>
              </div>

              <div className="mt-6">
                {activeTab === "posts" && (
                  <>
                    {loadingPosts ? (
                      <CompactStateCard text="Loading your posts..." />
                    ) : userPosts.length === 0 ? (
                      <EmptyCard
                        icon={<NotebookPen className="h-5 w-5" />}
                        title="No posts yet"
                        body="Your community posts will appear here once you start sharing food finds and budget tips."
                        buttonLabel="Go to Community"
                        href="/community"
                      />
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {userPosts.map((post) => (
                          <article
                            key={post.id}
                            className="group rounded-[24px] border border-[#dcefe8] bg-white/72 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-[11px] font-semibold text-[#0f766e]">
                                {post.tag}
                              </span>
                              <span className="text-xs text-[#6b7280]">
                                {formatRelativeTime(post.createdAt)}
                              </span>
                            </div>

                            <h3 className="font-poppins mt-4 line-clamp-2 text-base font-semibold text-[#111827]">
                              {post.title}
                            </h3>

                            <p className="mt-2 line-clamp-5 text-sm leading-6 text-[#4b5563]">
                              {post.body}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e5e7eb] pt-3">
                              <MetricPill label={`${post.likes} likes`} />
                              <MetricPill label={`${post.comments} comments`} />
                              <MetricPill label={`${post.saved} saves`} />
                            </div>

                            <div className="mt-4 flex items-center justify-between text-sm">
                              <span className="text-[#6b7280]">Your community post</span>
                              <Link
                                href="/home/community"
                                className="inline-flex items-center gap-1 font-medium text-[#0f766e] hover:underline"
                                >
                                View
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === "history" && (
                  <>
                    {loadingHistory ? (
                      <CompactStateCard text="Loading your history..." />
                    ) : historyItems.length === 0 ? (
                      <EmptyCard
                        icon={<CalendarClock className="h-5 w-5" />}
                        title="No history yet"
                        body="Generated meal plans will show up here once you start using the planner."
                      />
                    ) : (
                      <div className="grid gap-4 lg:grid-cols-2">
                        {historyItems.slice(0, 6).map((item, index) => (
                          <article
                            key={item.id || `${item.createdAt || item.date}-${index}`}
                            className="rounded-[24px] border border-[#dcefe8] bg-white/72 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-poppins text-base font-semibold text-[#111827]">
                                  {item.label || "Meal Plan"}
                                </p>
                                <p className="mt-1 text-xs text-[#6b7280]">
                                  {item.createdAt || item.date
                                    ? formatRelativeTime(
                                        item.createdAt || item.date || ""
                                      )
                                    : "Saved previously"}
                                </p>
                              </div>

                              <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-[11px] font-semibold text-[#047857]">
                                {formatPeso(item.totalCost)}
                              </span>
                            </div>

                            <div className="mt-4 grid gap-2">
                              {(item.meals || []).slice(0, 3).map((meal, mealIndex) => (
                                <div
                                  key={`${meal.mealName}-${mealIndex}`}
                                  className="rounded-[18px] border border-[#e2f2ec] bg-[#fbfffd] px-3 py-3"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-[#111827]">
                                        {meal.mealName}
                                      </p>
                                      <p className="mt-1 truncate text-xs text-[#6b7280]">
                                        {meal.establishmentName || "Establishment"}
                                      </p>
                                    </div>
                                    <span className="shrink-0 text-xs font-medium text-[#374151]">
                                      {formatPeso(meal.price)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}

                    {!loadingHistory && historyItems.length > 0 ? (
                      <div className="mt-4">
                        <Link href="/home/history">
                          <Button
                            variant="outline"
                            className="rounded-2xl border-[#cfe8df] bg-white/80 text-[#134e4a] hover:bg-[#f8fffd]"
                          >
                            View full history
                          </Button>
                        </Link>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <EditProfileModal
        open={editOpen}
        onOpenChange={setEditOpen}
        formData={formData}
        onChange={handleFieldChange}
        onSave={handleSaveProfile}
      />

      <LogoutConfirmationModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </>
  );
}

function HeaderMetaRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-[#0f766e]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function ProfileStatBubble({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-[#e2f2ec] bg-[#fbfffd] px-3 py-4 text-center shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="mb-2 flex items-center justify-center text-[#0f766e]">
        {icon}
      </div>
      <p className="font-poppins text-[28px] font-semibold leading-none text-[#111827]">
        {value}
      </p>
      <p className="mt-2 text-xs text-[#6b7280]">{label}</p>
    </div>
  );
}

function MiniTag({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-[#d7eee6] bg-[#f3fbf8] px-3 py-1.5 text-xs text-[#0f766e]">
      {text}
    </span>
  );
}

function VibeBadge({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7eee6] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#134e4a]">
      <span className="text-[#0f766e]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function QuickActionPill({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-[#d7eee6] bg-white/85 px-3 py-2 text-sm text-[#134e4a] transition hover:bg-[#f8fffd]"
    >
      <span className="text-[#0f766e]">{icon}</span>
      <span>{text}</span>
    </button>
  );
}

function MetricPill({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-[#e2f2ec] bg-white/80 px-3 py-1.5 text-[11px] text-[#4b5563]">
      {label}
    </div>
  );
}

function PreferenceChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
        selected
          ? "border-[#10b981] bg-[#ecfdf5] text-[#047857] shadow-sm"
          : "border-[#d7eee6] bg-white text-[#4b635d] hover:border-[#a7dcca] hover:bg-[#f8fffd]"
      }`}
    >
      {label}
    </button>
  );
}

function InsightRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[16px] border border-[#e2f2ec] bg-[#fbfffd] px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[#0f766e]">{icon}</span>
        <span className="truncate text-sm text-[#4b635d]">{label}</span>
      </div>
      <span className="max-w-[55%] truncate text-right text-sm font-semibold text-[#134e4a]">
        {value}
      </span>
    </div>
  );
}

function TimelineItem({
  icon,
  label,
  time,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  time: string;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      <div className="relative flex flex-col items-center">
        <div className="z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#d7eee6] bg-[#f3fbf8] text-[#0f766e]">
          {icon}
        </div>
        {!last ? <div className="mt-1 h-full w-px bg-[#d7eee6]" /> : null}
      </div>

      <div className="flex-1 rounded-[18px] border border-[#e2f2ec] bg-[#fbfffd] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-[#4b635d]">{label}</p>
          <span className="shrink-0 text-xs font-medium text-[#0f766e]">
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniEmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#cfe8df] bg-[#f8fffd] px-4 py-4">
      <div className="flex items-center gap-2 text-[#134e4a]">
        <span className="text-[#0f766e]">{icon}</span>
        <p className="text-sm font-medium">{title}</p>
      </div>
      <p className="mt-1 text-xs text-[#6b7280]">{body}</p>
    </div>
  );
}

function ProfileTabButton({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 pb-3 text-sm font-medium transition ${
        active ? "text-[#0f172a]" : "text-[#6b7280] hover:text-[#0f766e]"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span
        className={`absolute bottom-0 left-0 h-[2.5px] rounded-full transition-all ${
          active ? "w-full bg-[#10b981]" : "w-0 bg-transparent"
        }`}
      />
    </button>
  );
}

function CompactStateCard({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-[#dcefe8] bg-white/72 p-5 backdrop-blur-xl">
      <p className="font-poppins text-sm font-medium text-[#111827]">{text}</p>
    </div>
  );
}

function EmptyCard({
  icon,
  title,
  body,
  buttonLabel,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  buttonLabel?: string;
  href?: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#dcefe8] bg-white/72 p-8 text-center backdrop-blur-xl">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#0f766e]">
        {icon}
      </div>
      <p className="font-poppins mt-4 text-base font-semibold text-[#111827]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#6b7280]">{body}</p>

      {buttonLabel && href ? (
        <Link href={href}>
          <Button className="mt-4 rounded-2xl bg-[#0f766e] text-white hover:bg-[#115e59]">
            {buttonLabel}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}