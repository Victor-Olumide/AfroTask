import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getDoc } from "firebase/firestore"; // kept for potential future use
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Star, X, ChevronLeft, ChevronRight } from "lucide-react";
import { db, ensureFirebaseAuth } from "../../config/firebase";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// No fallback - use Firestore only

// ── Star rating display ──
function StarRating({ rating, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 transition-colors duration-150 ${
            star <= (interactive ? (hovered > 0 ? hovered : rating) : rating)
              ? "text-[#FB9E01] fill-[#FB9E01]"
              : "text-gray-300"
          } ${interactive ? "cursor-pointer" : ""}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange && onChange(star)}
        />
      ))}
    </div>
  );
}

// ── Review card ──
function ReviewCard({ review, onEdit, onDelete, user, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const isOwnReview =
    review.reviewerId === user?.id ||
    review.reviewerId === user?._id ||
    review.reviewerId === user?.uid;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="group relative flex h-full flex-col gap-4 rounded-2xl border border-black/[0.06] bg-white p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#00564C]/15 hover:shadow-[0_16px_32px_-16px_rgba(0,86,76,0.18)]"
    >
      <span className="absolute inset-x-6 top-0 h-[3px] scale-x-0 rounded-full bg-gradient-to-r from-[#FB9E01] to-[#00564C] transition-transform duration-300 ease-out group-hover:scale-x-100" />

      {/* Edit/Delete buttons for own reviews */}
      {isOwnReview && (
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(review);
            }}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-blue-100 p-1 text-blue-600 transition-all duration-200 hover:bg-blue-200 hover:text-blue-700 hover:shadow-sm"
            title="Edit review"
          >
            <MdModeEditOutline className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(review.id);
            }}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-red-100 p-1 text-red-600 transition-all duration-200 hover:bg-red-200 hover:text-red-700 hover:shadow-sm"
            title="Delete review"
          >
            <MdDelete className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Message */}
      <p className="flex-1 text-sm leading-relaxed text-[#3F4B47]">
        "{review.comment || review.message}"
      </p>

      {/* User info */}
      <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-black/5">
          <img
            src={
              review.reviewer?.profileImage ||
              review.reviewer?.profileIMage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer?.fullName || review.name || 'User')}&background=random`
            }
            alt={review.reviewer?.fullName || review.name || 'User'}
            className="h-10 w-10 rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer?.fullName || review.name || 'User')}&background=random`;
            }}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0B1F1C]">
            {review.reviewer?.fullName || review.name}
          </p>
          <p className="text-xs text-gray-400">
            {review.reviewer?.role || review.role}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Leave a Review Modal ──
function ReviewModal({ onClose, onSubmit, editingReview, user }) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    rating: 5,
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // RESTORED: This is the correct useEffect for the Modal to load existing review text
  useEffect(() => {
    if (user) {
      setForm({
        name: user.fullName || user.name || "",
        role: user.role === "freelancer" ? "Freelancer" : "Client",
        rating: editingReview?.rating || 5,
        message: editingReview?.comment || "",
      });
    }
  }, [user, editingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
    setDone(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {done ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E1F5EE]">
              <Star className="h-8 w-8 fill-[#00564C] text-[#00564C]" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#0B1F1C]">
              {editingReview ? "Review updated!" : "Thank you!"}
            </h3>
            <p className="mb-6 text-gray-500">
              Your review has been {editingReview ? "updated" : "submitted"}.
            </p>
            <button
              onClick={onClose}
              className="rounded-xl bg-[#00564C] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#027568]"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="mb-1 text-xl font-bold text-[#0B1F1C]">
              {editingReview ? "Edit review" : "Leave a review"}
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Share your experience with AfroTask
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rating
                </label>
                <StarRating
                  rating={form.rating}
                  interactive
                  onChange={(r) => setForm({ ...form, rating: r })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Your review
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Tell us about your experience..."
                  required
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition focus:border-[#00564C] focus:outline-none focus:ring-2 focus:ring-[#00564C]/30"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#00564C] py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[#027568] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? editingReview
                    ? "Updating..."
                    : "Submitting..."
                  : editingReview
                    ? "Update review"
                    : "Submit review"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main AppReviews section ──
export default function AppReviews() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [page, setPage] = useState(0);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });
  const usersCache = useRef({});

  const CARDS_PER_PAGE = 3;
  const totalPages = Math.ceil(reviews.length / CARDS_PER_PAGE);
  const visibleReviews = reviews.slice(
    page * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE + CARDS_PER_PAGE,
  );

  // THE CORRECTED USEEFFECT FOR FETCHING REVIEWS
  useEffect(() => {
    setLoadingReviews(true);
    const q = query(collection(db, "reviews"), limit(20));

    const unsubscribe = onSnapshot(
      q,
      async (snap) => {
        try {
          const rawReviews = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            ref: doc.ref,
          }));

          const getTimestamp = (val) => {
            if (!val) return 0;
            if (typeof val.toDate === 'function') return val.toDate().getTime();
            if (val.seconds) return val.seconds * 1000;
            return new Date(val).getTime() || 0;
          };

          const sortedReviews = [...rawReviews]
            .filter((r) => {
              const text = (r.comment || r.message || "").trim();
              // Require a real sentence: minimum length + at least one space (excludes gibberish like "hhjjghhhhh")
              return text.length >= 15 && text.includes(" ");
            })
            .sort((a, b) => {
              return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
            });

          let userReview = null;
          const currentUserId = user?.id || user?.uid || user?._id;

          if (currentUserId) {
            userReview = sortedReviews.find((r) => r.reviewerId === currentUserId);
          }

          const orderedReviews = userReview
            ? [userReview, ...sortedReviews.filter((r) => r.id !== userReview?.id)]
            : sortedReviews;

          const reviewsWithReviewers = await Promise.all(
            orderedReviews.map(async (review) => {
              let reviewer = null;

              if (!review.reviewerId) {
                return {
                  ...review,
                  reviewer: {
                    fullName: review.name || "Anonymous",
                    profileImage: null,
                    role: review.role || "Client",
                  }
                };
              }

              if (!usersCache.current[review.reviewerId]) {
                try {
                  // Fetch from backend API (works for all users, no Firestore permission issues)
                  const { default: api } = await import('../../services/api');
                  const res = await api.get(`/profile/public/${review.reviewerId}`);
                  const userData = res.data.profile;
                  usersCache.current[review.reviewerId] = {
                    fullName: userData.fullName || userData.name || review.name || "Anonymous",
                    profileImage: userData.profileImage || null,
                    role: userData.role === "freelancer" ? "Freelancer" : "Client",
                  };
                } catch (err) {
                  console.error(`Failed to fetch user ${review.reviewerId}:`, err);
                  usersCache.current[review.reviewerId] = {
                    fullName: review.name || "Anonymous",
                    profileImage: null,
                    role: review.role || "Client",
                  };
                }
              }

              reviewer = usersCache.current[review.reviewerId];
              return { ...review, reviewer };
            })
          );

          setReviews(reviewsWithReviewers);
          setError(null);
        } catch (err) {
          console.error("Snapshot processing error:", err);
          setError(err.message);
        } finally {
          setLoadingReviews(false);
        }
      },
      (error) => {
        console.error("Error loading reviews:", error);
        setError(
          error.code === "permission-denied"
            ? "Permission denied - check authentication"
            : error.message
        );
        setLoadingReviews(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleSubmitReview = async (form) => {
    if (!user?.id && !user?.uid && !user?._id) {
      toast.error("Please log in to leave a review.");
      navigate("/login");
      setShowModal(false);
      return;
    }

    try {
      await ensureFirebaseAuth();
      const currentUserId = user.id || user.uid || user._id;

      if (editingReview) {
        await updateDoc(editingReview.ref, {
          rating: form.rating,
          comment: form.message,
          updatedAt: serverTimestamp(),
        });
        toast.success("Review updated!");
        setEditingReview(null);
      } else {
        const existingQuery = query(
          collection(db, "reviews"),
          where("reviewerId", "==", currentUserId),
        );
        const existingSnap = await getDocs(existingQuery);

        if (!existingSnap.empty) {
          toast.error(
            "You already left a review. Edit it from your review below.",
          );
          return;
        }

        await addDoc(collection(db, "reviews"), {
          name: user.fullName || user.name || "Anonymous",
          role: user.role === "freelancer" ? "Freelancer" : "Client",
          rating: form.rating,
          comment: form.message,
          reviewerId: currentUserId,
          createdAt: serverTimestamp(),
        });
        toast.success("Review submitted!");
      }
      setShowModal(false);
    } catch (error) {
      console.error("Review submit error:", error.code, error.message);
      toast.error(`Failed to ${editingReview ? 'update' : 'submit'} review: ${error.message}`);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!user || !window.confirm("Delete your review?")) return;
    try {
      await ensureFirebaseAuth();
      await deleteDoc(doc(db, "reviews", reviewId));
      toast.success("Review deleted.");
    } catch (error) {
      toast.error("Failed to delete review.");
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <section className="relative overflow-hidden bg-[#FBFAF7] py-20 md:py-28">

      {/* Background */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(0,86,76,0.06) 0%, rgba(251,158,1,0.04) 45%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-14 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-px w-6 bg-[#FB9E01]" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FB9E01]">
              Testimonials
            </p>
            <span className="h-px w-6 bg-[#FB9E01]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-[#0B1F1C] md:text-3xl">
            Trusted by freelancers and clients worldwide
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-sm text-gray-500 md:text-base">
            Real stories from real people building their future with AfroTask.
          </p>

          {/* Aggregate rating badge */}
          <div className="inline-flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-3 px-6 shadow-[0_1px_2px_rgba(16,24,22,0.04),0_12px_32px_-16px_rgba(16,24,22,0.10)]">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="h-4 w-4 text-[#FB9E01] fill-[#FB9E01] md:h-5 md:w-5"
                />
              ))}
            </div>
            <span className="text-sm font-bold text-[#0B1F1C] md:text-lg">{avgRating}</span>
            <span className="text-xs text-gray-400 md:text-sm">
              / 5 · {reviews.length} reviews
            </span>
          </div>
        </motion.div>

        {loadingReviews ? (
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-3">
            {Array(3)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-2xl border border-black/[0.06] bg-white"
                />
              ))}
          </div>
        ) : error ? (

          <div className="col-span-full mb-6 rounded-2xl border border-black/[0.06] bg-white p-6 py-12 text-center shadow-sm lg:p-8">
            <X className="mx-auto mb-4 h-10 w-10 text-red-400 lg:h-12 lg:w-12" />
            <h3 className="mb-2 text-sm font-normal text-[#0B1F1C] lg:text-lg">
              Failed to load reviews
            </h3>
            <button className="mb-6 text-red-500 hover:text-red-400" onClick={() => window.location.reload()}>
              Refresh page
            </button>
          </div>

        ) : reviews.length === 0 ? (
          <div className="col-span-full py-4 text-center">
            <Star className="mx-auto mb-4 h-8 w-8 text-gray-300 lg:h-12 lg:w-12" />
            <h3 className="mb-4 text-sm font-bold text-[#0B1F1C] lg:text-xl">
              No reviews yet
            </h3>
            <p className="mx-auto mb-8 max-w-lg text-xs text-gray-500 lg:text-sm">
              Be the first to share your experience!
              <br />
              Your feedback helps freelancers and clients worldwide.
            </p>
          </div>
        ) : (
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-3">
            {visibleReviews.map((review, i) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={(review) => {
                  setEditingReview(review);
                  setShowModal(true);
                }}
                onDelete={handleDeleteReview}
                user={user}
                delay={i * 0.08}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mb-10 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-all hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    i === page ? "scale-125 bg-[#00564C]" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-all hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}

        {/* Leave a review button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <button
            onClick={() => {
              if (!user) {
                toast.error("Please log in to leave a review.");
                navigate("/welcome");
                return;
              }
              setShowModal(true);
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-10 py-4 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105 ${
              user
                ? "bg-[#00564C] text-white hover:bg-[#027568] hover:shadow-xl"
                : "cursor-not-allowed bg-gray-200 text-gray-500 shadow-none hover:scale-100"
            }`}
            title={!user ? "Log in to leave a review" : ""}
          >
            {!user ? "Sign up now" : "Leave a review"}
          </button>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ReviewModal
            editingReview={editingReview}
            user={user}
            onClose={() => {
              setShowModal(false);
              setEditingReview(null);
            }}
            onSubmit={async (form) => {
              await ensureFirebaseAuth();
              if (editingReview) {
                const updatedReview = {
                  ...editingReview,
                  rating: form.rating,
                  comment: form.message,
                  updatedAt: new Date(),
                };
                setReviews((prev) =>
                  prev.map((r) =>
                    r.id === editingReview.id ? updatedReview : r,
                  ),
                );
              } else {
                await handleSubmitReview(form);
              }
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}