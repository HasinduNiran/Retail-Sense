import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { 
  getAllCustomOrders,
  approveCustomOrder,
  rejectCustomOrder,
  updateCustomOrderStatus
} from "../../services/customOrderService";
import { FaCheck, FaTimes, FaEye, FaSyncAlt } from "react-icons/fa";
import Sidebar from "./Sidebar"; // Assuming Sidebar is in the same directory or adjust the path accordingly

const CustomOrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to control sidebar visibility

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, activeFilter, searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllCustomOrders();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching custom orders:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load custom orders",
      });
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (activeFilter !== "all") {
      filtered = filtered.filter((order) => order.status === activeFilter);
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.clothingType.toLowerCase().includes(search) ||
          order.customerInfo?.name?.toLowerCase().includes(search) ||
          order.customerInfo?.email?.toLowerCase().includes(search)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleViewDetails = (order) => {
    const statusBadge = {
      pending: '<span class="text-yellow-600 bg-yellow-100 px-2 pyclib1 rounded-full">Pending</span>',
      approved: '<span class="text-green-600 bg-green-100 px-2 py-1 rounded-full">Approved</span>',
      rejected: '<span class="text-red-600 bg-red-100 px-2 py-1 rounded-full">Rejected</span>',
      processing: '<span class="text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Processing</span>',
      shipped: '<span class="text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">Shipped</span>',
      delivered: '<span class="text-teal-600 bg-teal-100 px-2 py-1 rounded-full">Delivered</span>'
    };
    
    Swal.fire({
      title: `Custom ${order.clothingType.charAt(0).toUpperCase() + order.clothingType.slice(1)} Order`,
      html: `
        <div class="text-left">
          <div class="mb-4">
            <strong>Status:</strong> ${statusBadge[order.status] || order.status}
          </div>
          <div class="mb-4">
            <img src="${order.imageUrl}" alt="Custom Design" class="w-full h-64 object-contain mb-2 rounded-lg border" />
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <strong>Size:</strong> ${order.size}
            </div>
            <div>
              <strong>Quantity:</strong> ${order.quantity}
            </div>
            <div>
              <strong>Price:</strong> $${order.price.toFixed(2)}
            </div>
            <div>
              <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div class="mb-4">
            <strong>Special Instructions:</strong>
            <p class="text-gray-600">${order.specialInstructions || "None"}</p>
          </div>
          <div class="mb-4">
            <strong>Customer Info:</strong>
            <p class="mb-1">Name: ${order.customerInfo.name}</p>
            <p class="mb-1">Email: ${order.customerInfo.email}</p>
            <p>Mobile: ${order.customerInfo.mobile}</p>
          </div>
          <div>
            <strong>Delivery Address:</strong>
            <p class="mb-1">${order.deliveryInfo.address}</p>
            <p class="mb-1">${order.deliveryInfo.city}</p>
            <p>${order.deliveryInfo.postalCode}</p>
          </div>
        </div>
      `,
      width: 600,
      showCancelButton: order.status === 'pending',
      showDenyButton: order.status === 'pending',
      confirmButtonText: order.status === 'pending' ? 'Approve' : 'Close',
      confirmButtonColor: order.status === 'pending' ? '#10b981' : '#6366f1',
      denyButtonText: 'Reject',
      denyButtonColor: '#ef4444',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed && order.status === 'pending') {
        handleApprove(order);
      } else if (result.isDenied) {
        handleReject(order);
      }
    });
  };

  const handleApprove = async (order) => {
    try {
      setLoading(true);
      
      // Show confirmation modal first
      const confirmResult = await Swal.fire({
        title: 'Approve Custom Order',
        text: 'This will convert the custom order to a regular order. Proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, approve it',
      });
      
      if (!confirmResult.isConfirmed) {
        setLoading(false);
        return;
      }
      
      // Proceed with approval
      Swal.fire({
        title: 'Processing...',
        text: 'Converting custom order to regular order',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      const response = await approveCustomOrder(order._id);
      
      setLoading(false);
      Swal.close();
      
      if (response.success) {
        // Update the orders list
        const updatedOrders = orders.map(o => 
          o._id === order._id 
            ? { ...o, status: 'approved', convertedToOrder: true, orderId: response.order._id } 
            : o
        );
        setOrders(updatedOrders);
        
        Swal.fire({
          title: "Approved!",
          text: "Custom order has been approved and converted to regular order",
          icon: "success",
        });
      } else {
        throw new Error(response.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error approving order:", error);
      setLoading(false);
      
      // More descriptive error message
      Swal.fire({
        title: "Error!",
        html: `
          <div>
            <p>Failed to approve order: ${error.response?.data?.message || error.message || "Unknown error"}</p>
            ${error.response?.data?.customOrder 
              ? '<p class="mt-2 text-sm text-gray-600">Note: The order was marked as approved, but there was an error creating the regular order.</p>' 
              : ''}
          </div>
        `,
        icon: "error",
      });
      
      // If the backend returned an updated order despite the error, update the local state
      if (error.response?.data?.customOrder) {
        const updatedOrders = orders.map(o => 
          o._id === order._id 
            ? { ...o, status: 'approved' } 
            : o
        );
        setOrders(updatedOrders);
      }
    }
  };

  const handleReject = async (order) => {
    const { value: reason } = await Swal.fire({
      title: "Provide rejection reason",
      input: "textarea",
      inputPlaceholder: "Enter reason for rejection...",
      inputAttributes: {
        "aria-label": "Rejection reason"
      },
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#ef4444",
    });

    if (reason) {
      try {
        setLoading(true);
        const response = await rejectCustomOrder(order._id, reason);
        
        if (response.success) {
          const updatedOrders = orders.map(o => 
            o._id === order._id ? { ...o, status: 'rejected', rejectionReason: reason } : o
          );
          setOrders(updatedOrders);
          
          Swal.fire({
            title: "Rejected",
            text: "Custom order has been rejected",
            icon: "info",
          });
        }
      } catch (error) {
        console.error("Error rejecting order:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to reject order",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <motion.div
        className={`flex-1 p-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-[280px]" : "ml-[70px]"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-ExtraDarkColor">Custom Orders Management</h1>
          <button 
            onClick={fetchOrders} 
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <FaSyncAlt /> Refresh
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === "all"
                    ? "bg-white text-purple-600 shadow"
                    : "text-gray-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("pending")}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === "pending"
                    ? "bg-white text-purple-600 shadow"
                    : "text-gray-600"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveFilter("approved")}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === "approved"
                    ? "bg-white text-purple-600 shadow"
                    : "text-gray-600"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setActiveFilter("rejected")}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === "rejected"
                    ? "bg-white text-purple-600 shadow"
                    : "text-gray-600"
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setActiveFilter("processing")}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === "processing"
                    ? "bg-white text-purple-600 shadow"
                    : "text-gray-600"
                }`}
              >
                Processing
              </button>
            </div>

            {/* Search Box */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by clothing type, customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-500 text-lg">No custom orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Design Preview
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={order.imageUrl}
                          alt="Custom Design"
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          Custom {order.clothingType.charAt(0).toUpperCase() + order.clothingType.slice(1)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Size: {order.size} | Qty: {order.quantity}
                        </div>
                        <div className="text-sm text-gray-500">
                          Order Date: {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerInfo?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerInfo?.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerInfo?.mobile}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'approved' ? 'bg-green-100 text-green-800' :
                              order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                                    'bg-teal-100 text-teal-800'}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {order.convertedToOrder && (
                          <div className="mt-1 text-xs text-green-600">
                            Converted to Order
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                        >
                          <FaEye className="inline mr-1" /> View
                        </button>
                        
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(order)}
                              className="text-green-600 hover:text-green-900 mr-2"
                            >
                              <FaCheck className="inline mr-1" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(order)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTimes className="inline mr-1" /> Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CustomOrdersManagement;