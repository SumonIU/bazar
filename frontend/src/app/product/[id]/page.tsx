"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { apiFetch } from "@/lib/api";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240'>" +
  "<rect width='100%' height='100%' fill='%23f2eee8'/>" +
  "<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'" +
  " fill='%23999898' font-size='14' font-family='Arial'>No image</text>" +
  "</svg>";

type ProductDetail = {
  id: number;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  status: "in_stock" | "out_of_stock";
  nutritionInfo: string | null;
  description: string | null;
  image?: string | null;
  seller?: {
    id: number;
    fullName: string;
  } | null;
  reviews?: Array<{
    id: number;
    rating: number;
    comment: string | null;
    customer?: {
      fullName: string;
    } | null;
  }>;
};

type ProductDetailApi = ProductDetail & {
  images?: string | null;
};

export default function ProductPage() {
  const params = useParams();
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartStatus, setCartStatus] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadProduct = async (
    activeProductId: string,
    canUpdate?: () => boolean,
  ) => {
    if (canUpdate && !canUpdate()) {
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch<ProductDetailApi>(
        `products/${activeProductId}`,
      );
      const normalized = {
        ...data,
        image: data.image ?? data.images ?? null,
      };
      if (canUpdate && !canUpdate()) {
        return;
      }
      setProduct(normalized);
    } catch (fetchError) {
      if (canUpdate && !canUpdate()) {
        return;
      }
      const message =
        fetchError && typeof fetchError === "object" && "message" in fetchError
          ? String(fetchError.message)
          : "Unable to load product details.";
      setError(message);
    } finally {
      if (canUpdate && !canUpdate()) {
        return;
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!productId) {
      setError("Product not found.");
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const canUpdate = () => isMounted;
    loadProduct(String(productId), canUpdate).catch(() => {
      if (!isMounted) {
        return;
      }
    });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  useEffect(() => {
    let isMounted = true;

    apiFetch<{ user: { role: string } }>("auth/me")
      .then(({ user }) => {
        if (!isMounted) {
          return;
        }
        setUserRole(user.role);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setUserRole(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const nutritionText = product?.nutritionInfo
    ? `Nutrition info: ${product.nutritionInfo}.`
    : "Nutrition info: not provided.";

  const handleAddToCart = async () => {
    if (!productId) {
      setCartStatus("Product not found.");
      return;
    }

    setIsAddingToCart(true);
    setCartStatus(null);

    try {
      await apiFetch("cart", {
        method: "POST",
        body: JSON.stringify({
          productId: Number(productId),
          quantity: 1,
        }),
      });
      setCartStatus("Added to cart.");
    } catch (addError) {
      const message =
        addError &&
        typeof addError === "object" &&
        "status" in addError &&
        Number(addError.status) === 401
          ? "Please log in as a customer to add items."
          : addError && typeof addError === "object" && "message" in addError
            ? String(addError.message)
            : "Unable to add to cart.";
      setCartStatus(message);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleSubmitReview = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setReviewStatus(null);

    if (!productId || !product?.seller?.id) {
      setReviewStatus("Product details are incomplete.");
      return;
    }

    const ratingValue = Number(reviewRating);
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      setReviewStatus("Rating must be between 1 and 5.");
      return;
    }

    setIsSubmittingReview(true);

    try {
      await apiFetch("reviews", {
        method: "POST",
        body: JSON.stringify({
          productId: Number(productId),
          sellerId: product.seller.id,
          rating: ratingValue,
          comment: reviewComment.trim() || null,
        }),
      });
      setReviewStatus("Review submitted.");
      setReviewRating("5");
      setReviewComment("");
      await loadProduct(String(productId));
    } catch (submitError) {
      const message =
        submitError &&
        typeof submitError === "object" &&
        "status" in submitError
          ? Number(submitError.status) === 401
            ? "Please log in as a customer to leave a review."
            : submitError && "message" in submitError
              ? String(submitError.message)
              : "Unable to submit review."
          : submitError &&
              typeof submitError === "object" &&
              "message" in submitError
            ? String(submitError.message)
            : "Unable to submit review.";
      setReviewStatus(message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
            <img
              src={product?.image || FALLBACK_IMAGE}
              alt={product?.name ?? "Product"}
              onError={(event) => {
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
              className="h-64 w-full rounded-2xl border border-[var(--line)] object-cover"
            />
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="font-serif text-3xl">
              {isLoading ? "Loading..." : (product?.name ?? "Product")}
            </h1>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <>
                <p className="text-lg font-semibold">
                  BDT {product?.price ?? 0}
                  {product?.unit ? ` / ${product.unit}` : ""}
                </p>
                <p className="text-sm text-[var(--muted)]">{nutritionText}</p>
              </>
            )}
            <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
              <p className="text-sm font-medium">
                Seller: {product?.seller?.fullName ?? "Seller"}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {product?.status === "out_of_stock" ? (
                  <span className="font-semibold text-red-600">
                    Out of stock
                  </span>
                ) : (
                  `${product?.quantity ?? 0} in stock`
                )}
              </p>
            </div>
            {cartStatus ? (
              <p className="text-sm text-[var(--muted)]">{cartStatus}</p>
            ) : null}
            <div className="flex gap-3">
              {userRole === "customer" ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={
                    isAddingToCart || product?.status === "out_of_stock"
                  }
                  className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isAddingToCart ? "Adding..." : "Add to cart"}
                </button>
              ) : null}
              {userRole !== "seller" ? (
                <button className="rounded-full border border-[var(--line)] px-5 py-3 text-sm">
                  Call seller
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-10 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="text-lg font-semibold">Reviews</h2>
          {userRole === "customer" ? (
            <form className="mt-4 grid gap-4" onSubmit={handleSubmitReview}>
              <div className="grid gap-4 md:grid-cols-[140px_1fr] md:items-center">
                <label className="text-sm font-medium">Rating</label>
                <select
                  className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
                  value={reviewRating}
                  onChange={(event) => setReviewRating(event.target.value)}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Bad</option>
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                <label className="text-sm font-medium">Comment</label>
                <textarea
                  className="min-h-[110px] w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
                  placeholder="Share your experience (optional)"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                />
              </div>
              {reviewStatus ? (
                <p className="text-sm text-[var(--muted)]">{reviewStatus}</p>
              ) : null}
              <div>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit review"}
                </button>
              </div>
            </form>
          ) : null}
          {isLoading ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Loading reviews...
            </p>
          ) : product?.reviews?.length ? (
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              {product.reviews.map((review) => (
                <li key={review.id}>
                  <span className="text-[var(--accent)]">
                    {renderStars(review.rating)}
                  </span>
                  {review.comment ? ` ${review.comment}` : " No comment"} -
                  {review.customer?.fullName ?? "Customer"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">No reviews yet.</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function renderStars(rating: number) {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(clamped) + "☆".repeat(5 - clamped);
}
