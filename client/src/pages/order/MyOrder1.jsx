import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { PDFViewer } from "@react-pdf/renderer";
import LoadingSpinner from "../../components/Spinner";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import EditOrderPopup from "./EditOrderPopup";
import { useSelector } from "react-redux";
import Invoice from "./Invoice";
import { PDFDownloadLink } from "@react-pdf/renderer";
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";
import Lottie from "lottie-react";
import animationData from "../../assets/img/worker-packing-the-goods.json";
import animationData1 from "../../assets/img/deliveryman-riding-scooter.json";
import { FaSearch, FaBox, FaChevronDown, FaChevronUp, FaFileDownload, FaEdit, FaTrash } from "react-icons/fa";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?._id) return;
      
      try {
        const response = await axios.get(`/api/orders/get/${currentUser._id}`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        Swal.fire("Error", "Failed to fetch orders", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser?._id]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleUpdateOrder = (order) => {
    setSelectedOrder(order);
    setShowEditPopup(true);
  };

  const handleDeleteOrder = async (orderId) => {
    // Show confirmation dialog before deletion
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#89198f",
      cancelButtonColor: "#f8abfc",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`/api/orders/delete/${orderId}`);
        
        if (response.data.success) {
          // Remove the deleted order from state
          setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
          Swal.fire("Deleted!", "Your order has been deleted.", "success");
        } else {
          throw new Error(response.data.message || "Failed to delete order");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        Swal.fire(
          "Error",
          error.response?.data?.message || "Failed to delete order",
          "error"
        );
      }
    }
  };

  const handleToggleExpand = (orderId) => {
    setExpandedOrders((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  const filteredOrders = orders.filter((order) =>
    order.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status color based on order status
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-PrimaryColor/30 min-h-screen">
   
      <div className="p-6 w-full lg:w-3/4 mx-auto pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-DarkColor">My Orders</h1>
          <div className="flex-1 max-w-md ml-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Order ID"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full p-3 pl-10 border border-SecondaryColor/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-SecondaryColor bg-white shadow-sm"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-SecondaryColor" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white border border-SecondaryColor/20 p-6 rounded-2xl shadow-md relative"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-PrimaryColor p-3 rounded-xl mr-4">
                        <FaBox className="text-DarkColor text-xl" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-DarkColor">
                          Order #{order.orderId}
                        </h2>
                        <p className="text-gray-500 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()} at{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <button
                        onClick={() => handleToggleExpand(order._id)}
                        className="ml-4 p-2 hover:bg-PrimaryColor rounded-full transition-all"
                      >
                        {expandedOrders[order._id] ? 
                          <FaChevronUp className="text-DarkColor" /> : 
                          <FaChevronDown className="text-DarkColor" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Default View */}
                  <div>
                    <div className="flex flex-wrap gap-4 mt-4">
                      {order.items.map((item) => (
                        <div
                          key={item.itemId}
                          className="text-center flex flex-col items-center bg-PrimaryColor/20 p-3 rounded-xl"
                        >
                          <img
                            src={item.img}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-lg shadow-md"
                          />
                          <p className="text-DarkColor font-medium mt-2 text-sm">
                            {item.title}
                          </p>
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <span>Size: {item.size}</span>
                            <span className="mx-2">•</span>
                            <span className="flex items-center">
                              Color: 
                              <span 
                                style={{backgroundColor: item.color}} 
                                className="inline-block w-4 h-4 rounded-full ml-1 border border-gray-200"
                              />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <p className="text-DarkColor font-semibold">
                        Total: $
                        {order.items
                          .reduce(
                            (total, item) => total + item.price * item.quantity,
                            0
                          )
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {expandedOrders[order._id] && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      {/* Order Progress */}
                      <div className="w-full my-8 px-4">
                        <ProgressBar
                          percent={
                            order.status === "pending"
                              ? 0
                              : order.status === "processing"
                              ? 25
                              : order.status === "shipped"
                              ? 50
                              : order.status === "delivered"
                              ? 100
                              : order.status === "cancelled"
                              ? -1
                              : 0
                          }
                          filledBackground="linear-gradient(to right, #f8abfc, #89198f)"
                          height={6}
                        >
                          <Step>
                            {({ accomplished }) => (
                              <div className="flex flex-col items-center">
                                <div
                                  className={`rounded-full h-12 w-12 flex justify-center items-center ${
                                    accomplished ? "bg-SecondaryColor" : order.status === "cancelled" ? "bg-red-400" : "bg-gray-300"
                                  }`}
                                >
                                  <Lottie
                                    animationData={animationData}
                                    loop={accomplished}
                                    className="h-8 w-8"
                                  />
                                </div>
                                <p className="mt-2 text-xs font-medium text-DarkColor">Pending</p>
                              </div>
                            )}
                          </Step>
                          <Step>
                            {({ accomplished }) => (
                              <div className="flex flex-col items-center">
                                <div
                                  className={`rounded-full h-12 w-12 flex justify-center items-center ${
                                    accomplished ? "bg-SecondaryColor" : order.status === "cancelled" ? "bg-red-400" : "bg-gray-300"
                                  }`}
                                >
                                  <Lottie
                                    animationData={animationData}
                                    loop={accomplished}
                                    className="h-8 w-8"
                                  />
                                </div>
                                <p className="mt-2 text-xs font-medium text-DarkColor">Processing</p>
                              </div>
                            )}
                          </Step>
                          <Step>
                            {({ accomplished }) => (
                              <div className="flex flex-col items-center">
                                <div
                                  className={`rounded-full h-12 w-12 flex justify-center items-center ${
                                    accomplished ? "bg-SecondaryColor" : order.status === "cancelled" ? "bg-red-400" : "bg-gray-300"
                                  }`}
                                >
                                  <Lottie
                                    animationData={animationData1}
                                    loop={accomplished}
                                    className="h-8 w-8"
                                  />
                                </div>
                                <p className="mt-2 text-xs font-medium text-DarkColor">Shipped</p>
                              </div>
                            )}
                          </Step>
                          <Step>
                            {({ accomplished }) => (
                              <div className="flex flex-col items-center">
                                <div
                                  className={`rounded-full h-12 w-12 flex justify-center items-center ${
                                    accomplished ? "bg-SecondaryColor" : order.status === "cancelled" ? "bg-red-400" : "bg-gray-300"
                                  }`}
                                >
                                  <Lottie
                                    animationData={animationData1}
                                    loop={accomplished}
                                    className="h-8 w-8"
                                  />
                                </div>
                                <p className="mt-2 text-xs font-medium text-DarkColor">Delivered</p>
                              </div>
                            )}
                          </Step>
                        </ProgressBar>
                      </div>

                      {/* Order Details */}
                      <div className="grid md:grid-cols-3 gap-6 mb-6">
                        {/* Items Section */}
                        <div className="bg-PrimaryColor/10 p-4 rounded-xl">
                          <h3 className="text-lg font-semibold mb-3 text-DarkColor border-b border-SecondaryColor/20 pb-2">
                            Order Items
                          </h3>
                          <ul className="space-y-3">
                            {order.items.map((item) => (
                              <li key={item.itemId} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <img 
                                    src={item.img}
                                    alt={item.title}
                                    className="w-10 h-10 object-cover rounded-md mr-3"
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-DarkColor">{item.title}</p>
                                    <div className="flex items-center text-xs text-gray-600">
                                      <span>Size: {item.size}</span>
                                      <span className="mx-1">•</span>
                                      <span className="flex items-center">
                                        Color: 
                                        <span 
                                          style={{backgroundColor: item.color}} 
                                          className="inline-block w-3 h-3 rounded-full ml-1 border border-gray-200"
                                        />
                                      </span>
                                      <span className="mx-1">•</span>
                                      <span>Qty: {item.quantity}</span>
                                    </div>
                                  </div>
                                </div>
                                <p className="font-medium text-sm text-DarkColor">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Customer Information Section */}
                        <div className="bg-PrimaryColor/10 p-4 rounded-xl">
                          <h3 className="text-lg font-semibold mb-3 text-DarkColor border-b border-SecondaryColor/20 pb-2">
                            Customer Information
                          </h3>
                          <div className="space-y-2">
                            <p className="flex justify-between">
                              <span className="text-gray-600">Name:</span>
                              <span className="font-medium text-DarkColor">{order.customerInfo.name}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium text-DarkColor">{order.customerInfo.email}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-600">Mobile:</span>
                              <span className="font-medium text-DarkColor">{order.customerInfo.mobile}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-600">Payment Method:</span>
                              <span className="font-medium text-DarkColor">{order.paymentMethod}</span>
                            </p>
                          </div>
                        </div>

                        {/* Delivery Information Section */}
                        <div className="bg-PrimaryColor/10 p-4 rounded-xl">
                          <h3 className="text-lg font-semibold mb-3 text-DarkColor border-b border-SecondaryColor/20 pb-2">
                            Delivery Information
                          </h3>
                          {order.deliveryInfo.address ? (
                            <div className="space-y-2">
                              <p className="flex justify-between">
                                <span className="text-gray-600">Address:</span>
                                <span className="font-medium text-DarkColor">{order.deliveryInfo.address}</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-gray-600">City:</span>
                                <span className="font-medium text-DarkColor">{order.deliveryInfo.city}</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-gray-600">Postal Code:</span>
                                <span className="font-medium text-DarkColor">{order.deliveryInfo.postalCode}</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-gray-600">Method:</span>
                                <span className="font-medium text-DarkColor">Delivery</span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 italic">No delivery information</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 mt-6">
                        <button
                          onClick={() => handleUpdateOrder(order)}
                          className="flex items-center gap-2 bg-SecondaryColor hover:bg-SecondaryColor/80 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <FaEdit /> Update
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <FaTrash /> Delete
                        </button>
                        <PDFDownloadLink
                          document={<Invoice expandedOrders={order} />}
                          fileName="customer_invoice.pdf"
                          className="flex items-center gap-2 bg-DarkColor hover:bg-DarkColor/80 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          {({ loading }) => (
                            <>
                              <FaFileDownload />
                              {loading ? "Generating PDF..." : "Generate Report"}
                            </>
                          )}
                        </PDFDownloadLink>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-md text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-PrimaryColor rounded-full flex items-center justify-center">
                  <FaBox className="text-DarkColor text-2xl" />
                </div>
                <h3 className="text-xl font-medium text-DarkColor mb-2">No Orders Found</h3>
                <p className="text-gray-500">
                  You don't have any orders that match your search criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {showEditPopup && (
          <EditOrderPopup
            order={selectedOrder}
            onClose={() => setShowEditPopup(false)}
            onUpdate={(updatedOrder) => {
              setOrders((prevOrders) =>
                prevOrders.map((order) =>
                  order._id === updatedOrder._id ? updatedOrder : order
                )
              );
              setShowEditPopup(false);
            }}
          />
        )}
      </div>
      
    </div>
  );
};

export default MyOrders;