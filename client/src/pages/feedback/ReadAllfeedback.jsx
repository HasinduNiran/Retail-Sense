import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiStar, FiEdit, FiTrash2 } from "react-icons/fi";
import { MdFeedback } from "react-icons/md";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";
import API_CONFIG from "../../config/apiConfig.js"; // Adjust path as needed

function ReadAllFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all feedback on component mount
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_CONFIG.BASE_URL}/api/feedbacks`; // Adjusted endpoint
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to fetch feedback");
      }

      setFeedbacks(result.data); // Assuming backend returns data in a 'data' field
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message,
        confirmButtonColor: "#89198f",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    const numRating = parseInt(rating, 10); // Convert string rating to number
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={16}
            className={star <= numRating ? "text-yellow-400 fill-current" : "text-gray-400"}
          />
        ))}
      </div>
    );
  };

  // Handle Edit
  const handleEdit = (id) => {
    navigate(`/editfeedback/${id}`);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#89198f",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const url = `${API_CONFIG.BASE_URL}/api/feedbacks/${id}`;
          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || result.message || "Failed to delete feedback");
          }

          setFeedbacks(feedbacks.filter((feedback) => feedback._id !== id));
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Feedback has been deleted.",
            confirmButtonColor: "#89198f",
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: err.message,
            confirmButtonColor: "#89198f",
          });
        }
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-PrimaryColor p-6 flex items-center justify-center"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl border-2 border-SecondaryColor">
        {/* Header */}
        <div className="flex items-center mb-8 border-b-2 border-SecondaryColor pb-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-PrimaryColor hover:bg-SecondaryColor text-DarkColor p-2 rounded-full transition-all mr-4"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-DarkColor flex items-center">
            <div className="bg-PrimaryColor p-2 rounded-full mr-3">
              <MdFeedback className="text-DarkColor" size={24} />
            </div>
            All Feedback
          </h1>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <ClipLoader color="#89198f" size={50} />
          </div>
        ) : (
          /* Feedback Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-DarkColor">
              <thead className="bg-PrimaryColor text-DarkColor">
                <tr>
                  <th className="p-4 font-semibold">Feedback ID</th>
                  <th className="p-4 font-semibold">User ID</th>
                  <th className="p-4 font-semibold">Product ID</th>
                  <th className="p-4 font-semibold">Rating</th>
                  <th className="p-4 font-semibold">Comment</th>
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.length > 0 ? (
                  feedbacks.map((feedback) => (
                    <tr
                      key={feedback._id} // Use MongoDB _id
                      className="border-b border-SecondaryColor hover:bg-SecondaryColor/20"
                    >
                      <td className="p-4">{feedback.feedbackID || feedback._id}</td>
                      <td className="p-4">{feedback.userID}</td>
                      <td className="p-4">{feedback.productID}</td>
                      <td className="p-4">{renderStars(feedback.rating)}</td>
                      <td className="p-4">{feedback.comment || "N/A"}</td>
                      <td className="p-4">{feedback.orderID}</td>
                      <td className="p-4 flex space-x-2">
                        <button
                          onClick={() => handleEdit(feedback._id)}
                          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all"
                          title="Edit"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(feedback._id)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500">
                      No feedback found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ReadAllFeedback;