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
  nutritionInfo: string | null;
  description: string | null;
  image?: string | null;
  seller?: {
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

  useEffect(() => {
    let isMounted = true;

    if (!productId) {
      setError("Product not found.");
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    setError(null);

    apiFetch<ProductDetailApi>(`products/${productId}`)
      .then((data) => {
        if (!isMounted) {
          return;
        }
        const normalized = {
          ...data,
          image: data.image ?? data.images ?? null,
        };
        setProduct(normalized);
      })
      .catch((fetchError) => {
        if (!isMounted) {
          return;
        }
        const message =
          fetchError &&
          typeof fetchError === "object" &&
          "message" in fetchError
            ? String(fetchError.message)
            : "Unable to load product details.";
        setError(message);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

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
                {product?.quantity ?? 0} in stock
              </p>
            </div>
            {cartStatus ? (
              <p className="text-sm text-[var(--muted)]">{cartStatus}</p>
            ) : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAddingToCart ? "Adding..." : "Add to cart"}
              </button>
              <button className="rounded-full border border-[var(--line)] px-5 py-3 text-sm">
                Call seller
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="text-lg font-semibold">Reviews</h2>
          {isLoading ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Loading reviews...
            </p>
          ) : product?.reviews?.length ? (
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              {product.reviews.map((review) => (
                <li key={review.id}>
                  {review.rating} stars -
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
