import React, { useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaUser, FaLock, FaTimes, FaSpinner } from "react-icons/fa";
import API_CONFIG from "../../config/apiConfig.js"; // Add this import

export default function SignUp({ onClose, onSignIn }) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    repeatPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.email.includes("@")) {
      Swal.fire(
        "Invalid Email",
        "Please enter a valid email address.",
        "error"
      );
      return false;
    }
    if (formData.password.length < 8) {
      Swal.fire(
        "Weak Password",
        "Password must be at least 8 characters long.",
        "error"
      );
      return false;
    }
    if (formData.password !== formData.repeatPassword) {
      Swal.fire("Password Mismatch", "Passwords do not match.", "error");
      return false;
    }
    return true;
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username, // This becomes UserName in the backend
          email: formData.email,
          password: formData.password,
          mobile: 0, // Required field in the model
          role: "customer" // Set default role
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Swal.fire(
          "Success",
          "Your profile was created successfully!",
          "success"
        ).then(() => {
          onClose();
          onSignIn();
        });
      } else {
        Swal.fire("Error", data.message || "Failed to create account", "error");
      }
    } catch (error) {
      Swal.fire("Error", `Sign Up Error: ${error.message}`, "error");
      console.error("Sign Up Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: "email", type: "email", placeholder: "Email", icon: FaEnvelope },
    { name: "username", type: "text", placeholder: "Username", icon: FaUser },
    {
      name: "password",
      type: "password",
      placeholder: "Password",
      icon: FaLock,
    },
    {
      name: "repeatPassword",
      type: "password",
      placeholder: "Repeat Password",
      icon: FaLock,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md relative"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-600 hover:text-black transition duration-200"
          >
            <FaTimes size={24} />
          </motion.button>
          <h2 className="text-3xl font-bold text-DarkColor mb-6 text-center">
            Sign Up
          </h2>
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            {inputFields.map((field) => (
              <div key={field.name} className="relative">
                <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor transition duration-300"
                />
              </div>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full p-3 rounded-md ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-DarkColor hover:bg-DarkColor-dark"
              } text-white font-semibold transition duration-300 flex items-center justify-center`}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Signing Up...
                </>
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </form>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-gray-600"
          >
            Already have an account?{" "}
            <motion.span
              whileHover={{ scale: 1.05 }}
              onClick={onSignIn}
              className="text-DarkColor cursor-pointer hover:underline font-semibold"
            >
              Sign In
            </motion.span>
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
