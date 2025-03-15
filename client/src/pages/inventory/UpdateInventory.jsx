import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { MdInventory } from "react-icons/md";
import { BsTag } from "react-icons/bs";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";
import API_CONFIG from "../../config/apiConfig.js"; // Adjust path as needed

function UpdateInventory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    inventoryID: "",
    ItemName: "",
    Category: "",
    reorderThreshold: "",
    Quantity: "",
    Location: "",
    StockStatus: "in-stock",
    Brand: "",
    Sizes: [],
    Colors: [],
    Gender: "Unisex",
    Style: "Casual",
    SupplierName: "",
    SupplierContact: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch inventory item on mount
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/${id}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch inventory item");
        }

        setFormData({
          inventoryID: result.inventoryID,
          ItemName: result.ItemName,
          Category: result.Category,
          reorderThreshold: result.reorderThreshold,
          Quantity: result.Quantity,
          Location: result.Location,
          StockStatus: result.StockStatus,
          Brand: result.Brand,
          Sizes: result.Sizes || [],
          Colors: result.Colors || [],
          Gender: result.Gender,
          Style: result.Style,
          SupplierName: result.SupplierName,
          SupplierContact: result.SupplierContact,
        });
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

    fetchInventory();
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle array inputs (Sizes, Colors)
  const handleArrayChange = (e, field) => {
    const value = e.target.value.split(",").map((item) => item.trim());
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (formData.Quantity < 0 || formData.reorderThreshold < 0) {
      setError("Quantity and Reorder Threshold cannot be negative");
      setLoading(false);
      return;
    }

    try {
      const inventoryData = {
        ...formData,
        inventoryID: Number(formData.inventoryID),
        reorderThreshold: Number(formData.reorderThreshold),
        Quantity: Number(formData.Quantity),
      };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inventoryData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update inventory item");
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Inventory item updated successfully!",
        confirmButtonColor: "#89198f",
      }).then(() => {
        navigate("/inventory-management");
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
              <MdInventory className="text-DarkColor" size={24} />
            </div>
            Update Inventory Item
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
              {/* Inventory ID (Read-only) */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2 flex items-center">
                  <BsTag className="mr-2" />
                  Inventory ID
                </label>
                <input
                  type="number"
                  name="inventoryID"
                  value={formData.inventoryID}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg bg-gray-100 text-DarkColor"
                  readOnly
                />
              </div>

              {/* Item Name */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2">Item Name</label>
                <input
                  type="text"
                  name="ItemName"
                  value={formData.ItemName}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter item name"
                  required
                />
              </div>

              {/* Category */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2">Category</label>
                <input
                  type="text"
                  name="Category"
                  value={formData.Category}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter category"
                  required
                />
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quantity */}
                <div className="bg-PrimaryColor p-4 rounded-lg">
                  <label className="block text-DarkColor font-medium mb-2">Quantity</label>
                  <input
                    type="number"
                    name="Quantity"
                    value={formData.Quantity}
                    onChange={handleChange}
                    className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                    placeholder="Enter quantity"
                    required
                    min="0"
                  />
                </div>

                {/* Reorder Threshold */}
                <div className="bg-PrimaryColor p-4 rounded-lg">
                  <label className="block text-DarkColor font-medium mb-2">Reorder Threshold</label>
                  <input
                    type="number"
                    name="reorderThreshold"
                    value={formData.reorderThreshold}
                    onChange={handleChange}
                    className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                    placeholder="Enter threshold"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2">Location</label>
                <input
                  type="text"
                  name="Location"
                  value={formData.Location}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter location"
                  required
                />
              </div>

              {/* Stock Status */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2">Stock Status</label>
                <select
                  name="StockStatus"
                  value={formData.StockStatus}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor bg-white text-DarkColor"
                  required
                >
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>

              {/* Brand */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2">Brand</label>
                <input
                  type="text"
                  name="Brand"
                  value={formData.Brand}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter brand"
                  required
                />
              </div>

              {/* Sizes */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2">Sizes (comma-separated)</label>
                <input
                  type="text"
                  name="Sizes"
                  value={formData.Sizes.join(", ")}
                  onChange={(e) => handleArrayChange(e, "Sizes")}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="e.g., S, M, L"
                />
              </div>

              {/* Colors */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2">Colors (comma-separated)</label>
                <input
                  type="text"
                  name="Colors"
                  value={formData.Colors.join(", ")}
                  onChange={(e) => handleArrayChange(e, "Colors")}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="e.g., Red, Blue"
                />
              </div>

              {/* Gender */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2">Gender</label>
                <select
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor bg-white text-DarkColor"
                  required
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              {/* Style */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2">Style</label>
                <select
                  name="Style"
                  value={formData.Style}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor bg-white text-DarkColor"
                  required
                >
                  <option value="Casual">Casual</option>
                  <option value="Formal">Formal</option>
                  <option value="Athletic">Athletic</option>
                </select>
              </div>

              {/* Supplier Name */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2">Supplier Name</label>
                <input
                  type="text"
                  name="SupplierName"
                  value={formData.SupplierName}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter supplier name"
                  required
                />
              </div>

              {/* Supplier Contact */}
              <div className="bg-PrimaryColor p-4 rounded-lg">
                <label className="block text-DarkColor font-medium mb-2">Supplier Contact</label>
                <input
                  type="text"
                  name="SupplierContact"
                  value={formData.SupplierContact}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-SecondaryColor rounded-lg focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  placeholder="Enter supplier contact"
                  required
                />
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
                  <MdInventory className="mr-2" size={24} />
                )}
                {loading ? "Updating..." : "Update Inventory Item"}
              </button>
            </>
          )}
        </form>
      </div>
    </motion.div>
  );
}

export default UpdateInventory;