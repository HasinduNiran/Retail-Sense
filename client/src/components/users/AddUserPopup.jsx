import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { MdPersonAdd } from "react-icons/md";
import { BsPerson, BsEnvelope, BsLock, BsHouse, BsPhone } from "react-icons/bs";
import { FaUserTie } from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";
import API_CONFIG from "../../config/apiConfig.js";

function CreateUser1() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    UserName: "",
    email: "",
    password: "",
    address: "",
    mobile: "",
    role: "customer", // Default value
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
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

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        UserName: formData.UserName,
        email: formData.email,
        password: formData.password,
        address: formData.address || undefined,
        mobile: Number(formData.mobile),
        role: formData.role,
      };

      const url = `${API_CONFIG.BASE_URL}/api/users`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to create user");
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User created successfully!",
        confirmButtonColor: "#89198f",
      }).then(() => {
        window.location.reload();
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 px-4"
      >
        <motion.div
          initial={{ y: 20, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg border-2 border-SecondaryColor overflow-y-auto max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 border-b-2 border-SecondaryColor pb-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-PrimaryColor hover:bg-SecondaryColor text-DarkColor p-2 rounded-full transition-all mr-4 flex-shrink-0"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-DarkColor flex items-center flex-grow">
              <div className="bg-PrimaryColor p-2 rounded-full mr-3 flex-shrink-0">
                <MdPersonAdd className="text-DarkColor" size={22} />
              </div>
              Create New User
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm mb-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* UserName */}
              <div className="bg-PrimaryColor p-3 rounded-lg shadow-sm">
                <label className="block text-DarkColor font-medium mb-1 flex items-center text-sm">
                  <BsPerson className="mr-2" size={16} />
                  Username
                </label>
                <input
                  type="text"
                  name="UserName"
                  value={formData.UserName}
                  onChange={handleChange}
                  className="w-full p-2 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter username"
                  required
                />
              </div>

              {/* Email */}
              <div className="bg-PrimaryColor p-3 rounded-lg shadow-sm">
                <label className="block text-DarkColor font-medium mb-1 flex items-center text-sm">
                  <BsEnvelope className="mr-2" size={16} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="bg-PrimaryColor p-3 rounded-lg shadow-sm">
              <label className="block text-DarkColor font-medium mb-1 flex items-center text-sm">
                <BsLock className="mr-2" size={16} />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                placeholder="Enter password"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address */}
              <div className="bg-PrimaryColor p-3 rounded-lg shadow-sm">
                <label className="block text-DarkColor font-medium mb-1 flex items-center text-sm">
                  <BsHouse className="mr-2" size={16} />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter address"
                />
              </div>

              {/* Mobile */}
              <div className="bg-PrimaryColor p-3 rounded-lg shadow-sm">
                <label className="block text-DarkColor font-medium mb-1 flex items-center text-sm">
                  <BsPhone className="mr-2" size={16} />
                  Mobile
                </label>
                <input
                  type="number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full p-2 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter mobile number"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="bg-PrimaryColor p-3 rounded-lg shadow-sm">
              <label className="block text-DarkColor font-medium mb-1 flex items-center text-sm">
                <FaUserTie className="mr-2" size={16} />
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-DarkColor text-white p-3 rounded-lg flex items-center justify-center hover:bg-opacity-90 transition-all font-bold shadow-lg disabled:opacity-50 mt-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <ClipLoader color="#fff" size={20} className="mr-2" />
              ) : (
                <MdPersonAdd className="mr-2" size={20} />
              )}
              {loading ? "Creating User..." : "Create User"}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CreateUser1;