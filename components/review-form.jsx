"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ReviewForm({ locationId }) {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 0,
    review: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
const [cancelLoading, setCancelLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    if (!formData.name || !formData.email || !formData.review || formData.rating === 0) {
      setMessage({ type: "error", text: "Please fill in all fields and select a rating." })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Thank you! Your review has been submitted." })
        setFormData({ name: "", email: "", rating: 0, review: "" })
      } else {
        setMessage({ type: "error", text: "Failed to submit review. Please try again." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // navigate back to location detail page
    if (locationId) router.push(`/location-detail/${locationId}`)
    else router.back()
  }

  return (
    <div className="bg-[#CC9A55] border border-white rounded-2xl shadow-lg p-6 md:p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-black mb-2 border-b border-white pb-2">
        Share Your Experience
      </h2>
      <p className="text-gray-100 mb-6 py-2">
        We’d love to hear your feedback about this tour.
      </p>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "error"
              ? "bg-red-100 text-red-600 border border-red-300"
              : "bg-green-100 text-green-600 border border-green-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white border border-white/50 rounded-lg px-4 py-2 text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white border border-white/50 rounded-lg px-4 py-2 text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Rating *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className={`text-3xl transition-colors ${
                  formData.rating >= star ? "text-white" : "text-black"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Your Review *
          </label>
          <textarea
            value={formData.review}
            onChange={(e) => setFormData({ ...formData, review: e.target.value })}
            rows="4"
            className="w-full bg-white border border-white/50 rounded-lg px-4 py-2 text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Write your review..."
          />
        </div>

     <div className="flex flex-col sm:flex-row gap-3">
  {/* Submit Button */}
  <button
    type="submit"
    disabled={loading}
    className="w-full sm:w-auto bg-black disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:bg-[#b4843f] flex items-center justify-center gap-2"
  >
    {loading ? (
      <>
        <svg
          className="animate-spin h-5 w-5 text-[#CC9A55]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        Submitting...
      </>
    ) : (
      "Submit Review"
    )}
  </button>

  {/* Cancel Button */}
  <button
    type="button"
    onClick={async () => {
      setCancelLoading(true)
      if (locationId) router.push(`/location-detail/${locationId}`)
      else router.back()
      setTimeout(() => setCancelLoading(false), 1000) // optional delay to show spinner
    }}
    disabled={cancelLoading}
    className="w-full sm:w-auto bg-transparent border border-black text-black font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:bg-black hover:text-white flex items-center justify-center gap-2"
  >
    {cancelLoading ? (
      <>
        <svg
          className="animate-spin h-5 w-5 text-black"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        Cancelling...
      </>
    ) : (
      "Cancel"
    )}
  </button>
</div>

      </form>
    </div>
  )
}
