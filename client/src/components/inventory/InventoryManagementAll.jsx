import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiEdit, FiTrash2, FiPackage } from "react-icons/fi";
import { MdAdd, MdInventory } from "react-icons/md";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";
import API_CONFIG from "../../config/apiConfig.js"; // Adjust path as needed
import InventoryQuantityModal from "./InventoryQuantityModal";

function InventoryManagementAll() {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Remove any absolute path prefixes and ensure proper URL format
    const relativePath = imagePath.replace(/.*uploads[/\\]/, 'uploads/');
    return `${API_CONFIG.BASE_URL}/${relativePath}`;
  };

  // Fetch all inventory items with pagination
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}?page=${page}&limit=${limit}`;
      console.log("Fetching from URL:", url); // Debug: Log the URL
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      console.log("API Response:", result); // Debug: Log the full response

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch inventory items");
      }

      setInventoryItems(result.items);
      setTotalPages(result.pages);
    } catch (err) {
      console.error("Fetch Error:", err.message);
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
  }, [page, limit]);

  useEffect(() => {
    const loadInventory = async () => {
      await fetchInventory();
    };
    loadInventory();
  }, [fetchInventory]);

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

          await fetchInventory();
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

  // Handle quantity update
  const handleQuantityUpdate = (updatedItem) => {
    if (!updatedItem) return;

    setInventoryItems(items =>
      items.map(item =>
        item._id === updatedItem._id ? updatedItem : item
      )
    );

    // Update stock status color based on new quantity
    const stockStatus =
      updatedItem.Quantity <= 0 ? 'out-of-stock' :
        updatedItem.Quantity <= updatedItem.reorderThreshold ? 'low-stock' :
          'in-stock';

    // Show toast notification based on stock status
    if (stockStatus === 'low-stock') {
      Swal.fire({
        icon: 'warning',
        title: 'Low Stock Alert',
        text: `${updatedItem.ItemName} is running low on stock!`,
        confirmButtonColor: '#89198f',
      });
    }
  };

  // Open modal for managing quantity
  const handleManageQuantity = (item) => {
    if (!item) return;
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const getStockStatusClass = (status) => {
    switch (status) {
      case 'in-stock': return 'text-green-600';
      case 'low-stock': return 'text-yellow-600';
      case 'out-of-stock': return 'text-red-600';
      default: return '';
    }
  };

  // Render item image
  const renderItemImage = (item) => {
    return (
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={getImageUrl(item.image)}
          alt={item.ItemName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23cccccc"/><text x="50%" y="50%" font-size="12" text-anchor="middle" dy=".3em" fill="%23666666">No Image</text></svg>`;
          }}
        />
      </div>
    );
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
          <>
            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-DarkColor">
                <thead className="bg-PrimaryColor text-DarkColor">
                  <tr>
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Image</th>
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
                  {Array.isArray(inventoryItems) && inventoryItems.length > 0 ? (
                    inventoryItems.map((item) => {
                      // Debug log to see the image field
                      console.log('Item data:', {
                        itemName: item.ItemName,
                        imageField: item.image,
                        fullItem: item
                      });

                      return (
                        <tr
                          key={item.inventoryID || item._id}
                          className="border-b border-SecondaryColor hover:bg-SecondaryColor/20"
                        >
                          <td className="p-4">{item.inventoryID || item._id}</td>
                          <td className="p-4">{renderItemImage(item)}</td>
                          <td className="p-4">{item.ItemName}</td>
                          <td className="p-4">{item.Category}</td>
                          <td className="p-4">{item.Quantity}</td>
                          <td className="p-4">{item.reorderThreshold}</td>
                          <td className={`p-4 ${getStockStatusClass(item.StockStatus)}`}>
                            {item.StockStatus}
                          </td>
                          <td className="p-4">{item.Location}</td>
                          <td className="p-4">{item.Brand}</td>
                          <td className="p-4">{item.Gender}</td>
                          <td className="p-4">{item.Style}</td>
                          <td className="p-4">{item.SupplierName}</td>
                          <td className="p-4 flex space-x-2">
                            <button
                              onClick={() => handleEdit(item.inventoryID || item._id)}
                              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.inventoryID || item._id)}
                              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                            <button
                              onClick={() => handleManageQuantity(item)}
                              className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-all"
                              title="Manage Quantity"
                            >
                              <FiPackage size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="13" className="p-4 text-center text-gray-500">
                        No inventory items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg ${page === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-PrimaryColor hover:bg-SecondaryColor text-DarkColor"
                    }`}
                >
                  Previous
                </button>
                <span className="text-DarkColor">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg ${page === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-PrimaryColor hover:bg-SecondaryColor text-DarkColor"
                    }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {/* Quantity Management Modal */}
      <InventoryQuantityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onQuantityUpdate={handleQuantityUpdate}
      />
    </motion.div>
  );
}

export default InventoryManagementAll;