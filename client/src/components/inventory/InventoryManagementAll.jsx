import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiEdit, FiTrash2 } from "react-icons/fi";
import { MdAdd, MdInventory } from "react-icons/md";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";
import API_CONFIG from "../../config/apiConfig.js"; // Adjust path as needed

function InventoryManagementAll() {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all inventory items on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}`; // Using INVENTORY endpoint
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch inventory items");
      }

      setInventoryItems(result); // Backend returns array directly
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

  // Handle Delete
  const handleDelete = async (inventoryID) => {
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
          const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/${inventoryID}`;
          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || "Failed to delete inventory item");
          }

          setInventoryItems(inventoryItems.filter((item) => item.inventoryID !== inventoryID));
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Inventory item has been deleted.",
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

  // Handle Edit Navigation
  const handleEdit = (inventoryID) => {
    navigate(`/edit-inventory/${inventoryID}`);
  };

  // Handle Add Navigation
  const handleAdd = () => {
    navigate("/add-inventory");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-PrimaryColor p-6 flex items-center justify-center"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-6xl border-2 border-SecondaryColor">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b-2 border-SecondaryColor pb-4">
          <div className="flex items-center">
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
              Inventory Management
            </h1>
          </div>
          <button
            onClick={handleAdd}
            className="bg-DarkColor text-white p-2 rounded-full flex items-center hover:opacity-90 transition-all"
          >
            <MdAdd size={20} className="mr-1" />
            Add New
          </button>
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
          /* Inventory Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-DarkColor">
              <thead className="bg-PrimaryColor text-DarkColor">
                <tr>
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Item Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Quantity</th>
                  <th className="p-4 font-semibold">Reorder Threshold</th>
                  <th className="p-4 font-semibold">Stock Status</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Brand</th>
                  <th className="p-4 font-semibold">Gender</th>
                  <th className="p-4 font-semibold">Style</th>
                  <th className="p-4 font-semibold">Supplier</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.length > 0 ? (
                  inventoryItems.map((item) => (
                    <tr
                      key={item.inventoryID}
                      className="border-b border-SecondaryColor hover:bg-SecondaryColor/20"
                    >
                      <td className="p-4">{item.inventoryID}</td>
                      <td className="p-4">{item.ItemName}</td>
                      <td className="p-4">{item.Category}</td>
                      <td className="p-4">{item.Quantity}</td>
                      <td className="p-4">{item.reorderThreshold}</td>
                      <td className="p-4">{item.StockStatus}</td>
                      <td className="p-4">{item.Location}</td>
                      <td className="p-4">{item.Brand}</td>
                      <td className="p-4">{item.Gender}</td>
                      <td className="p-4">{item.Style}</td>
                      <td className="p-4">{item.SupplierName}</td>
                      <td className="p-4 flex space-x-2">
                        <button
                          onClick={() => handleEdit(item.inventoryID)}
                          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all"
                          title="Edit"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.inventoryID)}
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
                    <td colSpan="12" className="p-4 text-center text-gray-500">
                      No inventory items found
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

export default InventoryManagementAll;