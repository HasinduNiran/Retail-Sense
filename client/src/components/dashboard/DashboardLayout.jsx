// DashboardLayout.js
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { FaBars, FaTshirt } from "react-icons/fa";
import Header from "./Header"; // Add the Header component
import { Route, Routes, Link } from "react-router-dom";
import DashboardOverview from "./Dashboard";
import UserManagement from "./UserManagement";
import InventoryManagement from "./InventoryManagement";
import OrderManagement from "./OrderManagement";
import DiscountManagement from "./DiscountManagement";
// import SalesForecasting from "./SalesForcasting";
import Profile from "./Profile";
import CreateInventory from "../../pages/inventory/CreateInventory";
import AddOffer from "../discount&offer/AddOffer";
import UpdateOffer from "../discount&offer/UpdateOffer";
import FeedbackManagement from "./FeedbackManagement";
import CustomOrdersManagement from "./CustomOrdersManagement";

const contentVariants = {
  open: { marginLeft: 250, transition: { type: "spring", stiffness: 50 } },
  closed: { marginLeft: 0, transition: { type: "spring", stiffness: 50 } },
};

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FaBars />,
      count: 0,
      link: "/",
    },
    {
      id: "userManagement",
      label: "User Management",
      icon: <FaBars />,
      count: 0,
      link: "/user-management",
    },
    {
      id: "inventoryManagement",
      label: "Inventory Management",
      icon: <FaBars />,
      count: 0,
      link: "/inventory-management",
    },
    {
      id: "orderManagement",
      label: "Order Management",
      icon: <FaBars />,
      count: 0,
      link: "/order-management",
    },
    {
      id: "discountManagement",
      label: "Discount Management",
      icon: <FaBars />,
      count: 0,
      link: "/discount-management",
    },
    {
      id: "customOrders",
      label: "Custom Orders",
      icon: <FaTshirt />,
      count: 0,
      link: "/custom-orders",
    },
  ];

  return (
    <div className="relative min-h-screen bg-PrimaryColor">
      {/* Sidebar Component */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar}>
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className="block px-4 py-2 text-white hover:bg-gray-700"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </Sidebar>

      {/* Main Content */}
      <motion.main
        className="flex-1 ml-0 transition-all"
        variants={contentVariants}
        animate={isOpen ? "open" : "closed"}
      >
        <Header />

        {/* Routes for Dashboard Components */}
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route
            path="/inventory-management"
            element={<InventoryManagement />}
          />
          <Route
            path="/inventory-management/create"
            element={<CreateInventory />}
          />
          <Route path="/order-management" element={<OrderManagement />} />
          <Route
            path="/discount-management/*"
            element={<DiscountManagement />}
          />
          <Route path="/add-discount" element={<AddOffer />} />
          <Route path="/update-discount/:id" element={<UpdateOffer />} />
          <Route path="/allfeedbacks" element={<FeedbackManagement />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/custom-orders" element={<CustomOrdersManagement />} />
        </Routes>
      </motion.main>
    </div>
  );
}
