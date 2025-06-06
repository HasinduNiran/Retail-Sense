import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { MdPerson, MdImage } from "react-icons/md"; // Added MdImage for image field
import { BsPerson, BsEnvelope, BsHouse, BsPhone } from "react-icons/bs";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";
import API_CONFIG from "../../config/apiConfig.js"; // Adjust path as needed

function EditUser() {
  const { id } = useParams(); // Get userID from URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    UserName: "",
    email: "",
    address: "",
    mobile: "",
    image: null, // For new image upload
  });
  const [existingImage, setExistingImage] = useState(null); // To store current image path
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${API_CONFIG.BASE_URL}/api/users/${id}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || "Failed to fetch user");
        }

        const user = result.data; // Assuming data is nested in 'data'
        setFormData({
          UserName: user.UserName,
          email: user.email,
          address: user.address || "",
          mobile: user.mobile,
          image: null, // New image starts as null
        });
        setExistingImage(user.image || null); // Set existing image path
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

    fetchUser();
  }, [id]);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Optional: Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image (JPEG, PNG, or GIF)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size must be less than 5MB");
        return;
      }
    }
    setFormData((prev) => ({
      ...prev,
      image: file || null, // Set to null if no file selected
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!/^\d{10}$/.test(formData.mobile)) {
      setError("Mobile number must be 10 digits");
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      // Use FormData to handle file upload
      const data = new FormData();
      data.append("UserName", formData.UserName);
      data.append("email", formData.email);
      data.append("address", formData.address || "");
      data.append("mobile", Number(formData.mobile));
      if (formData.image) {
        data.append("image", formData.image); // Add new image if provided
      }

      const url = `${API_CONFIG.BASE_URL}/api/users/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        body: data, // No Content-Type header needed with FormData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to update user");
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User updated successfully!",
        confirmButtonColor: "#89198f",
      }).then(() => {
        navigate("/allusers"); // Redirect to AllUsers page
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message,
        confirmButtonColor: "#89198f",
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-PrimaryColor p-6 flex items-center justify-center"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg border-2 border-SecondaryColor">
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
              <MdPerson className="text-DarkColor" size={24} />
            </div>
            Edit User
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader color="#89198f" size={50} />
            </div>
          ) : (
            <>
              {/* UserName */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2 flex items-center">
                  <BsPerson className="mr-2" size={20} />
                  Username
                </label>
                <input
                  type="text"
                  name="UserName"
                  value={formData.UserName}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter username"
                  required
                />
              </div>

              {/* Email */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2 flex items-center">
                  <BsEnvelope className="mr-2" size={20} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter email"
                  required
                />
              </div>

              {/* Address */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2 flex items-center">
                  <BsHouse className="mr-2" size={20} />
                  Address (Optional)
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter address"
                />
              </div>

              {/* Mobile */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2 flex items-center">
                  <BsPhone className="mr-2" size={20} />
                  Mobile
                </label>
                <input
                  type="number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter mobile number"
                  required
                />
              </div>

              {/* Image Upload (Optional) */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2 flex items-center">
                  <MdImage className="mr-2" size={20} />
                  Profile Image (Optional)
                </label>
                {existingImage && !formData.image && (
                  <div className="mb-4">
                    <img
                      src={`${API_CONFIG.BASE_URL}${existingImage}`}
                      alt="Current Profile"
                      className="w-24 h-24 object-cover rounded-full mx-auto"
                    />
                    <p className="text-sm text-DarkColor text-center mt-2">Current Image</p>
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleImageChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                />
                {formData.image && (
                  <p className="mt-2 text-sm text-DarkColor">
                    Selected: {formData.image.name}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-DarkColor text-white p-4 rounded-lg flex items-center justify-center hover:opacity-90 transition-all font-bold shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <ClipLoader color="#fff" size={24} className="mr-2" />
                ) : (
                  <MdPerson className="mr-2" size={24} />
                )}
                {loading ? "Updating..." : "Update User"}
              </button>
            </>
          )}
        </form>
      </div>
    </motion.div>
  );
}

export default EditUser;