import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiTrash2, FiSearch } from "react-icons/fi";
import { MdDownload } from "react-icons/md";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";
import Modal from "react-modal";
import API_CONFIG from "../../config/apiConfig.js";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Custom styles for the modal
const customModalStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(5px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    position: "relative",
    top: "auto",
    left: "auto",
    right: "auto",
    bottom: "auto",
    maxWidth: "90%",
    width: "900px",
    maxHeight: "90vh",
    margin: "0 auto",
    padding: 0,
    border: "none",
    borderRadius: "0.75rem",
    backgroundColor: "white",
    overflow: "auto",
  },
};

function ReadAllFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState("csv");
  const [feedbackStats, setFeedbackStats] = useState({
    total: 0,
    averageRating: 0,
    withComments: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [monthlyFeedbackTrends, setMonthlyFeedbackTrends] = useState({});

  // Fetch all feedback on component mount
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_CONFIG.BASE_URL}/api/feedbacks`;
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

      setFeedbacks(result.data);
      calculateFeedbackStats(result.data);
      calculateMonthlyTrends(result.data);
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

  // Calculate feedback statistics
  const calculateFeedbackStats = (feedbackData) => {
    const total = feedbackData.length;
    const totalRating = feedbackData.reduce((sum, feedback) => sum + parseInt(feedback.rating || 0, 10), 0);
    const averageRating = total > 0 ? (totalRating / total).toFixed(1) : 0;
    const withComments = feedbackData.filter((feedback) => feedback.comment).length;
    const ratingDistribution = feedbackData.reduce((acc, feedback) => {
      const rating = parseInt(feedback.rating, 10);
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    setFeedbackStats({
      total,
      averageRating,
      withComments,
      ratingDistribution,
    });
  };

  // Get all months up to current month
  const getAllMonthsInRange = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const years = feedbacks.map(feedback => new Date(feedback.orderDate).getFullYear());
    const minYear = Math.min(...years, currentYear);

    const allMonths = [];
    for (let year = minYear; year <= currentYear; year++) {
      months.forEach((month, monthIndex) => {
        if (year < currentYear || (year === currentYear && monthIndex <= currentMonth)) {
          allMonths.push(`${month} ${year}`);
        }
      });
    }

    if (allMonths.length === 0) {
      for (let monthIndex = 0; monthIndex <= currentMonth; monthIndex++) {
        allMonths.push(`${months[monthIndex]} ${currentYear}`);
      }
    }

    return allMonths;
  };

  // Calculate monthly feedback trends
  const calculateMonthlyTrends = (feedbackData) => {
    const monthlyTrends = {};
    const allMonthsInRange = getAllMonthsInRange();

    allMonthsInRange.forEach(monthYear => {
      monthlyTrends[monthYear] = { total: 0, averageRating: 0 };
    });

    feedbackData.forEach(feedback => {
      const date = new Date(feedback.orderDate);
      const monthYear = `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyTrends[monthYear]) {
        monthlyTrends[monthYear].total += 1;
        monthlyTrends[monthYear].averageRating += parseInt(feedback.rating, 10);
      }
    });

    Object.keys(monthlyTrends).forEach(monthYear => {
      const total = monthlyTrends[monthYear].total;
      monthlyTrends[monthYear].averageRating = total > 0 ? (monthlyTrends[monthYear].averageRating / total).toFixed(1) : 0;
    });

    setMonthlyFeedbackTrends(monthlyTrends);
  };

  // Filter feedbacks by comment
  useEffect(() => {
    const filtered = feedbacks.filter((feedback) =>
      feedback.comment?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFeedbacks(filtered);
  }, [searchQuery, feedbacks]);

  // Render star rating
  const renderStars = (rating) => {
    const numRating = parseInt(rating, 10);
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

  // Helper function to get user ID
  const getUserId = (feedback) => {
    if (typeof feedback.userId === "string") {
      return feedback.userId; // If userId is a string, display it directly
    } else if (feedback.userId && typeof feedback.userId === "object" && feedback.userId._id) {
      return feedback.userId._id; // If userId is an object, get the _id
    }
    return "User Not Found"; // Fallback message
  };

  // Download CSV
  const downloadCSV = () => {
    const csvContent = [
      [
        "Feedback ID",
        "User ID",
        "Order ID",
        "Order Date",
        "Items",
        "Rating",
        "Comment",
      ],
      ...filteredFeedbacks.map((feedback) => [
        feedback._id,
        getUserId(feedback),
        feedback.orderId?.orderId || "N/A",
        feedback.orderDate
          ? `${new Date(feedback.orderDate).toLocaleDateString()} at ${new Date(feedback.orderDate).toLocaleTimeString()}`
          : "N/A",
        feedback.items
          ? feedback.items.map(item => `${item.itemTitle} (Qty: ${item.quantity}, Price: $${item.price.toFixed(2)}, Img: ${item.img})`).join("; ")
          : "N/A",
        feedback.rating,
        feedback.comment || "N/A",
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "feedback_report.csv");
  };

  // Download PDF
  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Page dimensions (A4: 210mm x 297mm)
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15; // Consistent margin on all sides

    // Colors consistent with the app
    const primaryColor = [137, 25, 143]; // #89198f
    const textColor = [40, 40, 40]; // Dark gray for text
    const lightGray = [245, 245, 245]; // Background for alternate rows

    // Header: Report Title and Date
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...textColor);
    doc.text("Feedback Report", margin, 20);

    // Subtitle: Generated Date
    const generatedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Lighter gray for subtitle
    doc.text(`Generated on: ${generatedDate}`, margin, 28);

    // Stats Cards Section
    const cardY = 40;
    const cardHeight = 20;
    const cardWidth = (pageWidth - margin * 2 - 10 * 2) / 3; // Three cards with 10mm gaps

    // Card 1: Total Feedback
    doc.setFillColor(240, 240, 240); // Light background for cards
    doc.rect(margin, cardY, cardWidth, cardHeight, "F");
    doc.setFontSize(12);
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "bold");
    doc.text("Total Feedback", margin + 5, cardY + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text(`${feedbackStats.total}`, margin + 5, cardY + 15);

    // Card 2: Average Rating
    doc.setFillColor(240, 240, 240);
    doc.rect(margin + cardWidth + 10, cardY, cardWidth, cardHeight, "F");
    doc.setFontSize(12);
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "bold");
    doc.text("Average Rating", margin + cardWidth + 15, cardY + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text(`${feedbackStats.averageRating}`, margin + cardWidth + 15, cardY + 15);

    // Card 3: With Comments
    doc.setFillColor(240, 240, 240);
    doc.rect(margin + (cardWidth + 10) * 2, cardY, cardWidth, cardHeight, "F");
    doc.setFontSize(12);
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "bold");
    doc.text("With Comments", margin + (cardWidth + 15) * 2, cardY + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text(`${feedbackStats.withComments}`, margin + (cardWidth + 15) * 2, cardY + 15);

    // Table Section
    const tableColumn = [
      "Feedback ID",
      "User ID",
      "Order ID",
      "Order Date",
      "Items",
      "Rating",
      "Comment",
    ];
    const tableRows = filteredFeedbacks.map((feedback) => [
      feedback._id,
      getUserId(feedback),
      feedback.orderId?.orderId || "N/A",
      feedback.orderDate
        ? `${new Date(feedback.orderDate).toLocaleDateString()} at ${new Date(feedback.orderDate).toLocaleTimeString()}`
        : "N/A",
      feedback.items
        ? feedback.items.map(item => `${item.itemTitle} (Qty: ${item.quantity}, Price: $${item.price.toFixed(2)})`).join("; ")
        : "N/A",
      feedback.rating,
      feedback.comment || "N/A",
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: cardY + cardHeight + 10, // Start below the stats cards with 10mm gap
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3, // Increased padding for better spacing
        overflow: "linebreak", // Allow text to wrap
        minCellHeight: 8, // Minimum height for rows
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
        halign: "center", // Center-align header text
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: lightGray, // Light gray for alternate rows
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Feedback ID
        1: { cellWidth: 25 }, // User ID
        2: { cellWidth: 25 }, // Order ID
        3: { cellWidth: 30 }, // Order Date
        4: { cellWidth: 40 }, // Items (wider for longer content)
        5: { cellWidth: 15 }, // Rating
        6: { cellWidth: 35 }, // Comment
      },
      didDrawPage: (data) => {
        // Footer: Page Number and Branding
        const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
        const footerY = pageHeight - 10;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${pageNumber}`, pageWidth - margin - 20, footerY);
        doc.text("Generated by Feedback Management System", margin, footerY);
      },
    });

    doc.save("feedback_report.pdf");
  };

  const handleDownload = () => {
    if (reportType === "csv") {
      downloadCSV();
    } else {
      downloadPDF();
    }
  };

  // Chart data for rating distribution
  const pieChartData = {
    labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    datasets: [
      {
        data: [
          feedbackStats.ratingDistribution[1],
          feedbackStats.ratingDistribution[2],
          feedbackStats.ratingDistribution[3],
          feedbackStats.ratingDistribution[4],
          feedbackStats.ratingDistribution[5],
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(54, 162, 235, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          padding: 8,
        },
      },
      title: {
        display: true,
        text: "Feedback Rating Distribution",
        padding: 10,
      },
    },
  };

  // Chart data for monthly feedback trends
  const monthlyTrendData = {
    labels: getAllMonthsInRange(),
    datasets: [
      // {
      //   label: "Feedback Count",
      //   data: getAllMonthsInRange().map(month => monthlyFeedbackTrends[month]?.total || 0),
      //   borderColor: "rgb(147, 51, 234)",
      //   backgroundColor: "rgba(147, 51, 234, 0.2)",
      //   tension: 0.4,
      //   fill: true,
      // },
      {
        label: "Average Rating",
        data: getAllMonthsInRange().map(month => monthlyFeedbackTrends[month]?.averageRating || 0),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 10,
        },
      },
      title: {
        display: true,
        text: "Monthly Feedback Trends",
        padding: 10,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count / Rating",
        },
      },
    },
  };

  const openModal = (feedback) => {
    setModalIsOpen(true);
    setSelectedFeedback(feedback);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedFeedback(null);
  };

  // Modal component for feedback details
  const FeedbackDetailsModal = ({ feedback, onClose }) => {
    if (!feedback) return null;

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Feedback Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Feedback Information</h3>
              <div className="space-y-3">
                <p><span className="font-medium">Feedback ID:</span> {feedback._id}</p>
                <p><span className="font-medium">User ID:</span> {getUserId(feedback)}</p>
                <p><span className="font-medium">Order ID:</span> {feedback.orderId?.orderId || "N/A"}</p>
                <p><span className="font-medium">Order Date:</span> {feedback.orderDate ? new Date(feedback.orderDate).toLocaleString() : "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Feedback Details</h3>
              <div className="space-y-3">
                <p><span className="font-medium">Rating:</span> {renderStars(feedback.rating)}</p>
                <p><span className="font-medium">Comment:</span> {feedback.comment || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-4">Ordered Items</h3>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <div className="divide-y divide-gray-200">
              {feedback.items?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="py-4 first:pt-0 last:pb-0 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.itemTitle}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${item.price?.toFixed(2)}</p>
                    {item.img && (
                      <img
                        src={item.img}
                        alt={item.itemTitle}
                        className="w-10 h-10 object-cover rounded mt-2"
                        onError={(e) => (e.target.src = "https://ui-avatars.com/api/?name=Product&size=40&background=random")}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-8"
    >
      <h1 className="text-3xl font-bold text-ExtraDarkColor mb-6">
        Feedback Management
      </h1>
      <div className="p-4">
        {/* Charts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow w-full max-w-xl">
            <h3 className="text-lg font-semibold mb-2">Rating Distribution</h3>
            <div className="h-64">
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          </div>
          {/* Removed the monthly trends chart as per the provided code */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Total Feedback</h3>
            <p className="text-2xl">{feedbackStats.total}</p>
          </div> */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Average Rating</h3>
            <p className="text-2xl">{feedbackStats.averageRating}</p>
          </div>
          {/* <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">With Comments</h3>
            <p className="text-2xl">{feedbackStats.withComments}</p>
          </div> */}
        </div>

        {/* Search and Download */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search by comment..."
              className="w-96 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex space-x-2">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
              >
                <MdDownload className="mr-2" />
                Download
              </button>
            </div>
          </div>
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
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                  {/* Actions column is commented out as per the provided code */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map((feedback) => (
                    <tr key={feedback._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {feedback._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getUserId(feedback)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {feedback.orderId?.orderId || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {feedback.orderDate ? new Date(feedback.orderDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-h-20 overflow-y-auto">
                          {feedback.items?.map((item, index) => (
                            <span key={index} className="text-gray-900">
                              {item.itemTitle}
                              {index < feedback.items.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {renderStars(feedback.rating)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {feedback.comment || "N/A"}
                      </td>
                      {/* Actions column is commented out as per the provided code */}
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

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customModalStyles}
        contentLabel="Feedback Details"
      >
        <div className="min-h-full w-full">
          <FeedbackDetailsModal feedback={selectedFeedback} onClose={closeModal} />
        </div>
      </Modal>
    </motion.div>
  );
}

export default ReadAllFeedback;