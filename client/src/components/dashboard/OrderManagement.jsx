import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "react-modal";
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";
import Lottie from "lottie-react";
import animationData from "../../assets/img/worker-packing-the-goods.json";
import animationData1 from "../../assets/img/deliveryman-riding-scooter.json";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import SalesReport from "./SalesReport";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { init, send } from "emailjs-com";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartImage, setChartImage] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState({
    _id: "", // Order ID
    userId: "", // User ID
    items: [
      {
        itemId: "",
        quantity: 0,
        price: 0,
        title: "",
        color: "",
        size: "",
        img: "",
      },
    ],
    total: 0, // Total amount
    customerInfo: {
      name: "",
      email: "",
      mobile: "",
    },
    deliveryInfo: {
      address: "",
      city: "",
      postalCode: "",
    },
    paymentMethod: "", // e.g., 'Card', 'Cash'
    orderId: "", // Generated Order ID
    createdAt: "", // Date when the order was placed
    status: "Pending", // Default status is 'Pending'
  });

  const [filteredOrder, setFilteredOrder] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [dates, setDates] = useState([]);

  init("jm1C0XkEa3KYwvYK0");

  const chartRef = useRef();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders");
        if (response.data) {
          setOrders(response.data);
          const allDates = response.data.map((ord) => ord.createdAt.split("T")[0]);
          setDates([...new Set(allDates)]); // Remove duplicates
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch orders. Please try again.',
        });
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchValue) {
      const searchedOrders = orders.filter((item) =>
        item.orderId.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.customerInfo.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.customerInfo.email.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredOrder(searchedOrders);
    } else {
      setFilteredOrder(orders);
    }
  }, [searchValue, orders]);

  const handleStatusChange = async (order, id, newStatus) => {
    try {
      const result = await Swal.fire({
        title: 'Update Order Status',
        text: `Do you want to change the status to ${newStatus}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it',
        cancelButtonText: 'No, cancel',
        confirmButtonColor: '#89198f',
      });

      if (result.isConfirmed) {
        const response = await axios.put(`/api/order/status/${id}`, {
          status: newStatus,
        });

        if (response.data) {
          // Send email notification
          await send("service_fjpvjh9", "template_1x528d6", {
            to_email: order.customerInfo.email,
            status: newStatus,
            order_id: order.orderId,
            customer_name: order.customerInfo.name,
          });

          // Update local state
          setOrders(prevOrders => 
            prevOrders.map(ord => 
              ord._id === id ? { ...ord, status: newStatus } : ord
            )
          );

          Swal.fire({
            icon: 'success',
            title: 'Status Updated',
            text: `Order status has been updated to ${newStatus}`,
            confirmButtonColor: '#89198f',
          });
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update order status. Please try again.',
        confirmButtonColor: '#89198f',
      });
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Order',
        text: 'Are you sure you want to delete this order? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'No, keep it',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#89198f',
      });

      if (result.isConfirmed) {
        const response = await axios.delete(`/api/order/delete/${orderId}`);
        
        if (response.data) {
          setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
          
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'The order has been deleted.',
            confirmButtonColor: '#89198f',
          });
        }
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete order. Please try again.',
        confirmButtonColor: '#89198f',
      });
    }
  };

  const getTodayDay = (x) => {
    const today = new Date();
    today.setDate(today.getDate() - x);
    const options = {
      weekday: "long",
    };
    const formattedDate = today.toLocaleDateString("en-CA", options);
    console.log(formattedDate);
    return formattedDate;
  };

  const getDate = (x) => {
    const today = new Date();
    today.setDate(today.getDate() - x);
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const formattedDate = today.toLocaleDateString("en-CA", options);
    const dayOrder = orders.filter((item) =>
      item.createdAt.split("T")[0].includes(formattedDate)
    );
    const lengths = dayOrder.length;
    return lengths;
  };

  const dddf = getDate(27);
  console.log(dddf);

  const xLabels = [
    getTodayDay(0),
    getTodayDay(1),
    getTodayDay(2),
    getTodayDay(3),
    getTodayDay(4),
    getTodayDay(5),
    getTodayDay(6),
  ];

  const uData = [
    getDate(0),
    getDate(1),
    getDate(2),
    getDate(3),
    getDate(4),
    getDate(5),
    getDate(6),
  ];

  const openCard = (order) => {
    setIsModalOpen(true);
    setSelectedOrder(order);
    console.log(selectedOrder);
    console.log("Selected Order:", selectedOrder.customerInfo);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <motion.div
      className=" p-5 bg-PrimaryColor min-h-screen ml-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-ExtraDarkColor mb-6">
        Order Management
      </h1>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Orders
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === "pending"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending Orders
            </button>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by Order ID, Customer, or Email"
              className="px-4 py-2 border rounded-lg w-80"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <PDFDownloadLink
              document={<SalesReport orders={filteredOrder} />}
              fileName="sales-report.pdf"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
            >
              {({ loading }) => (
                loading ? "Generating..." : "Generate Report"
              )}
            </PDFDownloadLink>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(activeTab === "all" ? filteredOrder : filteredOrder.filter(order => order.status === "Pending"))
                .map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customerInfo.name}</div>
                      <div className="text-sm text-gray-500">{order.customerInfo.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, order._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold
                          ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openCard(order)}
                        className="text-purple-600 hover:text-purple-900 mr-4"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="text-center bg-white p-10 h-fit w-3/4 max-w-4xl rounded-xl ml-20"
        overlayClassName="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 rounded-xl"
      >
        <div
          className="overflow-y-auto p-10 rounded-xl"
          style={{ height: "600px" }}
        >
          {/* Modal Header */}
          <h2 className="mb-20 font-bold text-3xl">Order Details</h2>

          {/* Progress Bar */}
          <div className="w-full mb-10">
            <ProgressBar
              percent={
                selectedOrder.status === "Pending"
                  ? 0
                  : selectedOrder.status === "Shipped"
                  ? 50
                  : selectedOrder.status === "Delivered"
                  ? 100
                  : 0
              }
              filledBackground="linear-gradient(to right, #00A896, #028090)"
            >
              <Step>
                {({ accomplished }) => (
                  <div className="flex flex-col items-center">
                    <div
                      className={`bg-gray-300 rounded-full h-14 w-14 flex justify-center items-center ${
                        accomplished ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <Lottie
                        animationData={animationData}
                        loop={accomplished}
                        className="h-40 w-30"
                      />
                    </div>
                    <p className="mt-2 text-sm">Pending</p>
                  </div>
                )}
              </Step>
              <Step>
                {({ accomplished }) => (
                  <div className="flex flex-col items-center">
                    <div
                      className={`bg-gray-300 rounded-full h-14 w-14 flex justify-center items-center ${
                        accomplished ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <Lottie
                        animationData={animationData1}
                        loop={accomplished}
                        className="h-40 w-30"
                      />
                    </div>
                    <p className="mt-2 text-sm">Shipped</p>
                  </div>
                )}
              </Step>
              <Step>
                {({ accomplished }) => (
                  <div className="flex flex-col items-center">
                    <div
                      className={`bg-gray-300 rounded-full h-14 w-14 flex justify-center items-center ${
                        accomplished ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <Lottie
                        animationData={animationData1}
                        loop={accomplished}
                        className="h-40 w-30"
                      />
                    </div>
                    <p className="mt-2 text-sm">Delivered</p>
                  </div>
                )}
              </Step>
            </ProgressBar>
          </div>

          {/* Order Info */}
          <div className="p-6">
            {/* Order Summary */}
            <div className="bg-slate-100 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-5 ">
                <div className="flex gap-2">
                  <h3 className="font-semibold">Order ID:</h3>
                  <p>{selectedOrder.orderId}</p>
                </div>
                <div className="flex gap-2">
                  <h3 className="font-semibold">Payment Method: </h3>
                  <p>{selectedOrder.paymentMethod}</p>
                </div>
                <div className="flex gap-2">
                  <h3 className="font-semibold">Total Amount:</h3>
                  <p>${selectedOrder.total}</p>
                </div>
                <div className="flex gap-2">
                  <h3 className="font-semibold">Order Date:</h3>
                  <p>
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            {/* Customer and Delivery Info (Side by Side) */}
            <div className="mt-10 grid grid-cols-2 gap-5 text-left">
              {/* Customer Info */}
              <div className="bg-slate-100 p-2 rounded-lg">
                <h3 className="font-semibold text-xl mb-3">
                  Customer Information
                </h3>
                <div className="flex gap-2">
                  <h4 className="font-semibold">Customer Name:</h4>
                  <p>{selectedOrder.customerInfo.name || "N/A"}</p>
                </div>
                <div className="flex gap-2">
                  <h4 className="font-semibold">Email:</h4>
                  <p>{selectedOrder.customerInfo.email || "N/A"}</p>
                </div>
                <div className="flex gap-2">
                  <h4 className="font-semibold">Mobile:</h4>
                  <p>{selectedOrder.customerInfo.mobile || "N/A"}</p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-slate-100 p-2 rounded-lg">
                <h3 className="font-semibold text-xl mb-3">
                  Delivery Information
                </h3>
                <div className="flex gap-2">
                  <h4 className="font-semibold">Address:</h4>
                  <p>{selectedOrder.deliveryInfo.address || "N/A"}</p>
                </div>
                <div className="flex gap-2">
                  <h4 className="font-semibold">City:</h4>
                  <p>{selectedOrder.deliveryInfo.city || "N/A"}</p>
                </div>
                <div className="flex gap-2">
                  <h4 className="font-semibold">Postal Code:</h4>
                  <p>{selectedOrder.deliveryInfo.postalCode || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mt-10">
              <h3 className="font-semibold text-xl mb-3">Ordered Items</h3>
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Item</th>
                    <th className="py-2 px-4 border-b">Color</th>
                    <th className="py-2 px-4 border-b">Size</th>
                    <th className="py-2 px-4 border-b">Quantity</th>
                    <th className="py-2 px-4 border-b">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 border-b">{item.title}</td>
                      <td className="py-2 px-4 border-b">{item.color}</td>
                      <td className="py-2 px-4 border-b">{item.size}</td>
                      <td className="py-2 px-4 border-b">{item.quantity}</td>
                      <td className="py-2 px-4 border-b">${item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={closeModal}
            className="mt-10 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
