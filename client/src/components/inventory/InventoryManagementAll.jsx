// React and Router imports
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";

// UI Framework imports
import { motion, AnimatePresence } from "framer-motion";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";

// Icons
import { FiArrowLeft, FiEdit, FiTrash2, FiPackage, FiX, FiMessageSquare, FiSend, FiUser, FiCpu, FiTrendingUp, FiDollarSign, FiShoppingBag, FiBox } from "react-icons/fi";
import { MdAdd, MdInventory, MdFileDownload } from "react-icons/md";

// PDF Generation
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Local imports
import API_CONFIG from "../../config/apiConfig.js";
import axios from 'axios';
import InventoryQuantityModal from "./InventoryQuantityModal";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I can help you with inventory information. What would you like to know?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = React.useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions] = useState([
    "How many items are in stock?",
    "Which categories have low stock?",
    "What's the most valuable item?",
    "Show items from Nike",
    "Which location has most items?"
  ]);

  // Search and filter logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(inventoryItems);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = inventoryItems.filter(item => 
        item.ItemName?.toLowerCase().includes(query) ||
        item.Category?.toLowerCase().includes(query) ||
        item.Brand?.toLowerCase().includes(query) ||
        item.Style?.toLowerCase().includes(query)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, inventoryItems]);

  // Size rendering logic
  const renderSizes = (sizes) => {
    if (!sizes) return "-";

    const renderSizeContent = (sizeArray) => {
      return (
        <div className="flex flex-wrap gap-1">
          {sizeArray.map((size, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-medium"
            >
              {size}
            </div>
          ))}
        </div>
      );
    };

    try {
      const parsedSizes = JSON.parse(sizes);
      if (Array.isArray(parsedSizes)) {
        return renderSizeContent(parsedSizes);
      }
    } catch {
      // If JSON parsing fails, try to split the string
      const sizeArray = sizes
        .split(/[,\s]+/) // Split on commas and whitespace
        .map(s => s.replace(/[^a-zA-Z0-9]/g, ''))
        .filter(s => s)
        .map(s => s.toUpperCase());

      return renderSizeContent([...new Set(sizeArray)]);
    }
  };

  // Color rendering logic
  const renderColors = (colors) => {
    if (!colors) return "-";

    const isValidColor = (color) => {
      const style = new Option().style;
      style.color = color;
      return style.color !== '';
    };

    const renderColorContent = (colorArray) => {
      return (
        <div className="flex gap-1">
          {colorArray.map((color, index) => {
            const colorValue = color.toLowerCase();
            return (
              <div
                key={index}
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ 
                  backgroundColor: isValidColor(colorValue) ? colorValue : '#cccccc',
                  border: ['white', 'yellow', 'lime'].includes(colorValue) ? '1px solid #d1d5db' : 'none'
                }}
                title={color}
              />
            );
          })}
        </div>
      );
    };

    try {
      const parsedColors = JSON.parse(colors);
      if (Array.isArray(parsedColors)) {
        return renderColorContent(parsedColors);
      }
    } catch {
      // If JSON parsing fails, try to split the string
      const colorArray = colors
        .split(/[,\s]+/) // Split on commas and whitespace
        .map(c => c.replace(/[^a-zA-Z0-9]/g, ''))
        .filter(c => c)
        .map(c => c.toUpperCase());

      return renderColorContent([...new Set(colorArray)]);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const relativePath = imagePath.replace(/.*uploads[/\\]/, 'uploads/');
    return `${API_CONFIG.BASE_URL}/${relativePath}`;
  };

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY.BASE}?page=${page}&limit=${limit}`;
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

      setInventoryItems(result.items);
      setTotalPages(result.pages);
    } catch (error) {
      console.error("Fetch Error:", error.message);
      setError(error.message);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message,
        confirmButtonColor: "#89198f",
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleError = (error) => {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'An error occurred',
      confirmButtonColor: '#89198f',
    });
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#89198f',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY.BASE}/${id}`);
        setInventoryItems(prev => prev.filter(item => (item.inventoryID || item._id) !== id));
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Item has been deleted.',
          confirmButtonColor: '#89198f',
        });
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleEdit = (inventoryID) => {
    navigate(`/edit-inventory/${inventoryID}`);
  };

  const handleAdd = () => {
    navigate("/add-inventory");
  };

  const handleQuantityUpdate = (updatedItem) => {
    if (!updatedItem) return;

    setInventoryItems(items =>
      items.map(item =>
        item._id === updatedItem._id ? updatedItem : item
      )
    );

    const stockStatus =
      updatedItem.Quantity <= 0 ? 'out-of-stock' :
        updatedItem.Quantity <= updatedItem.reorderThreshold ? 'low-stock' :
          'in-stock';

    if (stockStatus === 'low-stock') {
      Swal.fire({
        icon: 'warning',
        title: 'Low Stock Alert',
        text: `${updatedItem.ItemName} is running low on stock!`,
        confirmButtonColor: '#89198f',
      });
    }
  };

  const handleManageQuantity = (item) => {
    if (!item) return;
    setSelectedItem(item);
    setIsModalOpen(true);
  };

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

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add title and header
    const title = "Fashion Nexus - Inventory Report";
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    // Add logo or header image (if available)
    // doc.addImage('/logo.png', 'PNG', 15, 10, 30, 30);
    
    // Title styling
    doc.setFontSize(20);
    doc.setTextColor(89, 25, 143); // Purple color (#59198F)
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
    
    // Date and time
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${date} at ${time}`, pageWidth - 15, 30, { align: 'right' });
    
    // Summary section
    doc.setFontSize(12);
    doc.setTextColor(60);
    const totalItems = inventoryItems.length;
    const totalQuantity = inventoryItems.reduce((sum, item) => sum + (item.Quantity || 0), 0);
    
    doc.text('Inventory Summary:', 15, 40);
    doc.text(`Total Items: ${totalItems}`, 15, 48);
    doc.text(`Total Quantity: ${totalQuantity}`, 15, 56);
    
    // Prepare table data
    const tableData = inventoryItems.map(item => [
      item.ItemName || '-',
      item.Category || '-',
      (item.Quantity || 0).toString(),
      item.Brand || '-',
      item.Style || '-',
      Array.isArray(item.Colors) ? item.Colors.join(', ') : (item.Colors || '-'),
      Array.isArray(item.Sizes) ? item.Sizes.join(', ') : (item.Sizes || '-')
    ]);
    
    // Table styling
    doc.autoTable({
      startY: 70,
      head: [['Name', 'Category', 'Quantity', 'Brand', 'Style', 'Colors', 'Sizes']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [89, 25, 143], // Purple color
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { top: 70 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 }
      }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save('FashionNexus-Inventory-Report.pdf');
  };

  // Data for charts
  const stockStatusData = [
    { name: 'In Stock', value: inventoryItems.filter(item => item.StockStatus === 'in-stock').length },
    { name: 'Low Stock', value: inventoryItems.filter(item => item.StockStatus === 'low-stock').length },
    { name: 'Out of Stock', value: inventoryItems.filter(item => item.StockStatus === 'out-of-stock').length },
  ];

  const categoryData = Object.entries(
    inventoryItems.reduce((acc, item) => {
      acc[item.Category] = (acc[item.Category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Quantity Trends Over Time (assuming inventoryItems have a `createdAt` field)
  const quantityTrendData = inventoryItems
    .map(item => ({
      date: new Date(item.createdAt).toLocaleDateString(),
      quantity: item.Quantity,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Top 5 Items by Quantity
  const topItemsByQuantity = inventoryItems
    .sort((a, b) => b.Quantity - a.Quantity)
    .slice(0, 5)
    .map(item => ({ name: item.ItemName, quantity: item.Quantity }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Generate item-specific recommendations
  const generateRecommendations = () => {
    const recommendations = [];

    // Low stock items
    const lowStockItems = inventoryItems.filter(
      item => item.StockStatus === 'low-stock'
    );
    if (lowStockItems.length > 0) {
      recommendations.push(
        ...lowStockItems.map(
          item => `Restock "${item.ItemName}" as it is low on stock.`
        )
      );
    }

    // Out-of-stock items
    const outOfStockItems = inventoryItems.filter(
      item => item.StockStatus === 'out-of-stock'
    );
    if (outOfStockItems.length > 0) {
      recommendations.push(
        ...outOfStockItems.map(
          item => `Replenish "${item.ItemName}" as it is out of stock.`
        )
      );
    }

    // Top 5 items by quantity (to avoid overstocking)
    const topItemsByQuantity = inventoryItems
      .sort((a, b) => b.Quantity - a.Quantity)
      .slice(0, 5);
    if (topItemsByQuantity.length > 0) {
      recommendations.push(
        ...topItemsByQuantity.map(
          item => `Monitor "${item.ItemName}" to avoid overstocking.`
        )
      );
    }

    // Items with zero or negative quantities
    const zeroQuantityItems = inventoryItems.filter(
      item => item.Quantity <= 0
    );
    if (zeroQuantityItems.length > 0) {
      recommendations.push(
        ...zeroQuantityItems.map(
          item => `Address "${item.ItemName}" as it has zero or negative quantity.`
        )
      );
    }

    return recommendations;
  };

  // Recommendations based on current inventory data
  const recommendations = generateRecommendations();

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Process the question and generate a response with a more natural delay
    setTimeout(() => {
      const botResponse = generateBotResponse(chatInput);
      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 1000);
    
    // Clear input field
    setChatInput('');
  };

  // Handle clicking a suggested question
  const handleSuggestedQuestion = (question) => {
    setChatInput(question);
    handleChatSubmit({ preventDefault: () => {} });
  };

  const generateBotResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    // GENERAL INVENTORY QUERIES
    if (lowerQuestion.includes('total items') || lowerQuestion.includes('how many items') || 
        lowerQuestion.match(/^how many (products|inventory items)/)) {
      return `There are a total of ${inventoryItems.length} items in the inventory.`;
    }
    
    // STOCK STATUS QUERIES
    if (lowerQuestion.includes('low stock') || lowerQuestion.includes('low on stock')) {
      const lowStockItems = inventoryItems.filter(item => item.StockStatus === 'low-stock');
      if (lowStockItems.length === 0) {
        return "There are no items currently in low stock.";
      }
      return `There are ${lowStockItems.length} items in low stock: ${lowStockItems.map(item => item.ItemName).join(', ')}.`;
    }
    
    if (lowerQuestion.includes('out of stock')) {
      const outOfStockItems = inventoryItems.filter(item => item.StockStatus === 'out-of-stock');
      if (outOfStockItems.length === 0) {
        return "There are no items currently out of stock.";
      }
      return `There are ${outOfStockItems.length} items out of stock: ${outOfStockItems.map(item => item.ItemName).join(', ')}.`;
    }

    if (lowerQuestion.includes('in stock') && !lowerQuestion.includes('low') && !lowerQuestion.includes('out')) {
      const inStockItems = inventoryItems.filter(item => item.StockStatus === 'in-stock');
      return `There are ${inStockItems.length} items currently in stock.`;
    }
    
    // QUANTITY QUERIES
    if (lowerQuestion.includes('total quantity')) {
      const totalQuantity = inventoryItems.reduce((sum, item) => sum + (item.Quantity || 0), 0);
      return `The total quantity of all items is ${totalQuantity} units.`;
    }
    
    if (lowerQuestion.includes('most stocked') || lowerQuestion.includes('highest quantity')) {
      const mostStockedItem = [...inventoryItems].sort((a, b) => b.Quantity - a.Quantity)[0];
      return `The item with the highest quantity is "${mostStockedItem.ItemName}" with ${mostStockedItem.Quantity} units.`;
    }

    if (lowerQuestion.includes('least stocked') || lowerQuestion.includes('lowest quantity')) {
      const leastStockedItem = [...inventoryItems].sort((a, b) => a.Quantity - b.Quantity)[0];
      return `The item with the lowest quantity is "${leastStockedItem.ItemName}" with ${leastStockedItem.Quantity} units.`;
    }
    
    // CATEGORY QUERIES
    if (lowerQuestion.includes('categories') || lowerQuestion.includes('category list')) {
      const categories = [...new Set(inventoryItems.map(item => item.Category))];
      return `Available categories are: ${categories.join(', ')}.`;
    }

    const categoryMatch = lowerQuestion.match(/items in (.*?) category/);
    if (categoryMatch || lowerQuestion.includes('category')) {
      let categoryName;
      
      if (categoryMatch) {
        categoryName = categoryMatch[1];
      } else {
        // Extract category name from the question
        const words = lowerQuestion.split(' ');
        const categoryIndex = words.findIndex(word => word === 'category');
        if (categoryIndex > 0) {
          categoryName = words[categoryIndex - 1];
        }
      }
      
      if (categoryName) {
        const categoryItems = inventoryItems.filter(
          item => item.Category.toLowerCase().includes(categoryName)
        );
        
        if (categoryItems.length === 0) {
          return `No items found in the "${categoryName}" category.`;
        }
        
        return `There are ${categoryItems.length} items in the "${categoryName}" category: ${categoryItems.map(item => item.ItemName).join(', ')}.`;
      }
    }

    // BRAND QUERIES
    if (lowerQuestion.includes('brands') || lowerQuestion.includes('brand list')) {
      const brands = [...new Set(inventoryItems.map(item => item.Brand))];
      return `Available brands are: ${brands.join(', ')}.`;
    }

    const brandMatch = lowerQuestion.match(/items from (.*?)(\s|$)/);
    if (brandMatch || (lowerQuestion.includes('brand') && !lowerQuestion.includes('brands'))) {
      let brandName;
      
      if (brandMatch) {
        brandName = brandMatch[1];
      } else {
        // Extract brand name from the question
        const words = lowerQuestion.split(' ');
        const brandIndex = words.findIndex(word => word === 'brand');
        if (brandIndex > 0) {
          brandName = words[brandIndex - 1];
        }
      }
      
      if (brandName) {
        const brandItems = inventoryItems.filter(
          item => item.Brand.toLowerCase().includes(brandName)
        );
        
        if (brandItems.length === 0) {
          return `No items found from the "${brandName}" brand.`;
        }
        
        return `There are ${brandItems.length} items from "${brandName}": ${brandItems.map(item => item.ItemName).join(', ')}.`;
      }
    }
    
    // LOCATION QUERIES
    if (lowerQuestion.includes('location') || lowerQuestion.includes('where')) {
      const locations = [...new Set(inventoryItems.map(item => item.Location))];
      
      if (lowerQuestion.includes('most items') || lowerQuestion.includes('most products')) {
        const locationCounts = inventoryItems.reduce((acc, item) => {
          acc[item.Location] = (acc[item.Location] || 0) + 1;
          return acc;
        }, {});
        
        const topLocation = Object.entries(locationCounts)
          .sort((a, b) => b[1] - a[1])[0];
          
        return `The location with the most items is "${topLocation[0]}" with ${topLocation[1]} items.`;
      }
      
      return `Items are stored at these locations: ${locations.join(', ')}.`;
    }
    
    // PRICE/VALUE QUERIES (if unitPrice exists)
    if (lowerQuestion.includes('price') || lowerQuestion.includes('value') || 
        lowerQuestion.includes('expensive') || lowerQuestion.includes('cheapest')) {
      
      const itemsWithPrice = inventoryItems.filter(item => item.unitPrice != null);
      
      if (itemsWithPrice.length === 0) {
        return "I don't have pricing information for the inventory items.";
      }
      
      if (lowerQuestion.includes('most expensive') || lowerQuestion.includes('highest price')) {
        const mostExpensive = [...itemsWithPrice].sort((a, b) => b.unitPrice - a.unitPrice)[0];
        return `The most expensive item is "${mostExpensive.ItemName}" at $${mostExpensive.unitPrice}.`;
      }
      
      if (lowerQuestion.includes('cheapest') || lowerQuestion.includes('lowest price')) {
        const cheapest = [...itemsWithPrice].sort((a, b) => a.unitPrice - b.unitPrice)[0];
        return `The cheapest item is "${cheapest.ItemName}" at $${cheapest.unitPrice}.`;
      }
      
      if (lowerQuestion.includes('total value')) {
        const totalValue = itemsWithPrice.reduce(
          (sum, item) => sum + (item.unitPrice * (item.Quantity || 0)), 0
        );
        return `The total inventory value is $${totalValue.toFixed(2)}.`;
      }
    }
    
    // SPECIFIC ITEM QUERIES - More flexible matching
    // Try to find any item name in the question
    const potentialItemMatches = inventoryItems.filter(item => 
      lowerQuestion.includes(item.ItemName.toLowerCase())
    );
    
    if (potentialItemMatches.length > 0) {
      // Use the longest matching item name (most specific)
      const itemMatch = potentialItemMatches.sort((a, b) => 
        b.ItemName.length - a.ItemName.length
      )[0];
      
      return `Information about "${itemMatch.ItemName}":
      • Category: ${itemMatch.Category}
      • Brand: ${itemMatch.Brand}
      • Quantity: ${itemMatch.Quantity} units
      • Stock Status: ${itemMatch.StockStatus}
      • Location: ${itemMatch.Location}
      • Style: ${itemMatch.Style}
      • Gender: ${itemMatch.Gender}
      • Supplier: ${itemMatch.SupplierName}
      • Reorder Threshold: ${itemMatch.reorderThreshold}`;
    }
    
    // HELP/GUIDANCE QUERY
    if (lowerQuestion.includes('help') || lowerQuestion.includes('what can you do')) {
      return `I can answer questions about the inventory such as:
      • Total number of items
      • Stock status (in-stock, low-stock, out-of-stock)
      • Quantity information
      • Category and brand details
      • Information about specific items
      • Location information
      
      Try asking me something like "Which items are low on stock?" or "Tell me about Nike products."`;
    }
    
    // Generic response for unrecognized questions
    return "I'm not sure about that. Try asking about inventory counts, stock status, specific items, categories, or brands. You can type 'help' to see what I can do.";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-PrimaryColor p-6 flex items-center justify-center"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-6xl border-2 border-SecondaryColor min-h-[80vh]">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "inventory" ? "bg-PrimaryColor text-DarkColor" : "bg-gray-200"
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "insights" ? "bg-PrimaryColor text-DarkColor" : "bg-gray-200"
            }`}
          >
            Insights
          </button>
        </div>

        {activeTab === "inventory" && (
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
            <div className="flex gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={generatePDF}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <MdFileDownload className="w-5 h-5" />
                Generate Report
              </button>
              <button
                onClick={handleAdd}
                className="bg-DarkColor text-white p-2 rounded-full flex items-center hover:opacity-90 transition-all"
              >
                <MdAdd size={20} className="mr-1" />
                Add New
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <ClipLoader color="#89198f" size={50} />
          </div>
        ) : (
          <>
            {activeTab === "inventory" && (
              <div className="overflow-x-auto min-h-[60vh]">
                <table className="w-full text-left text-DarkColor">
                  <thead className="bg-PrimaryColor text-DarkColor">
                    <tr>
                      <th className="p-4 font-semibold">ID</th>
                      <th className="p-4 font-semibold">Image</th>
                      <th className="p-4 font-semibold">Item Name</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Quantity</th>
                      <th className="p-4 font-semibold">Colors</th>
                      <th className="p-4 font-semibold">Sizes</th>
                      <th className="p-4 font-semibold">Reorder Threshold</th>
                      <th className="p-4 font-semibold">Stock Status</th>
                      <th className="p-4 font-semibold">Location</th>
                      <th className="p-4 font-semibold">Brand</th>
                      <th className="p-4 font-semibold">Gender</th>
                      <th className="p-4 font-semibold">Style</th>
                      <th className="p-4 font-semibold">Supplier Name</th>
                      <th className="p-4 font-semibold">Supplier Contact</th>
                      <th className="p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(filteredItems) && filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <tr
                          key={item.inventoryID || item._id}
                          className="border-b border-SecondaryColor hover:bg-SecondaryColor/20"
                        >
                          <td className="p-4">{item.inventoryID || item._id}</td>
                          <td className="p-4">{renderItemImage(item)}</td>
                          <td className="p-4">{item.ItemName || '-'}</td>
                          <td className="p-4">{item.Category || '-'}</td>
                          <td className="p-4">{(item.Quantity || 0).toString()}</td>
                          <td className="p-4">
                            {renderColors(item.Colors || item.colors)}
                          </td>
                          <td className="p-4">
                            {renderSizes(item.Sizes || item.sizes)}
                          </td>
                          <td className="p-4">{item.reorderThreshold || '-'}</td>
                          <td className={`p-4 ${getStockStatusClass(item.StockStatus || '-')}`}>
                            {item.StockStatus || '-'}
                          </td>
                          <td className="p-4">{item.Location || '-'}</td>
                          <td className="p-4">{item.Brand || '-'}</td>
                          <td className="p-4">{item.Gender || '-'}</td>
                          <td className="p-4">{item.Style || '-'}</td>
                          <td className="p-4">{item.SupplierName || '-'}</td>
                          <td className="p-4">{item.SupplierContact || '-'}</td>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="16" className="p-4 text-center text-gray-500">
                          No inventory items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "insights" && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-DarkColor mb-6">Inventory Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Stock Status Distribution</h3>
                    <PieChart width={400} height={300}>
                      <Pie
                        data={stockStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stockStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
                    <BarChart width={400} height={300} data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Quantity Trends Over Time</h3>
                    <LineChart width={400} height={300} data={quantityTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="quantity" stroke="#8884d8" />
                    </LineChart>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Top 5 Items by Quantity</h3>
                    <BarChart width={400} height={300} data={topItemsByQuantity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" fill="#8884d8" />
                    </BarChart>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <ul className="list-disc pl-6">
                    {recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

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
      
      {/* Enhanced Chatbot UI */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isChatOpen ? 'w-96' : 'w-auto'}`}>
        {/* Chat toggle button */}
        <motion.button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center ml-auto"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiMessageSquare size={24} />
        </motion.button>
        
        {/* Chat window */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl overflow-hidden mt-4 border border-purple-100"
            >
              {/* Chat header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 flex items-center">
                <FiCpu className="mr-2" size={20} />
                <h3 className="font-medium">Inventory Assistant</h3>
              </div>
              
              {/* Chat messages */}
              <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                <AnimatePresence>
                  {chatMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'bot' && (
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2 flex-shrink-0">
                          <FiCpu className="text-purple-600" />
                        </div>
                      )}
                      
                      <div
                        className={`p-3 rounded-2xl max-w-xs ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-br-none shadow-md'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                        }`}
                      >
                        {msg.text.split('\n').map((line, i) => (
                          <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                        ))}
                      </div>
                      
                      {msg.sender === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center ml-2 flex-shrink-0">
                          <FiUser className="text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex mb-4"
                    >
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                        <FiCpu className="text-purple-600" />
                      </div>
                      <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none">
                        <div className="flex space-x-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.7, repeatDelay: 0.1 }}
                            className="h-2 w-2 rounded-full bg-purple-600"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.7, delay: 0.2, repeatDelay: 0.1 }}
                            className="h-2 w-2 rounded-full bg-purple-600"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.7, delay: 0.4, repeatDelay: 0.1 }}
                            className="h-2 w-2 rounded-full bg-purple-600"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>
              
              {/* Suggested questions */}
              <div className="p-3 border-t border-gray-100 bg-white">
                <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-100 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Chat input */}
              <form onSubmit={handleChatSubmit} className="border-t border-gray-100 p-3 flex">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about inventory..."
                  className="flex-1 border border-gray-200 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-transparent"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-r-lg"
                >
                  <FiSend size={20} />
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
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