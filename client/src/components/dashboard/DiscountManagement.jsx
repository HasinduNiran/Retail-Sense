import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DiscountTable from "../discount&offer/ExistingDiscounts";
import AddOffer from "../discount&offer/AddOffer";
import ItemsforDiscount from "../discount&offer/ItemsforDiscount";
import RetrievedInventoryTable from "../inventory/RetrievedInventoryTable";
import DiscountTrend from "../discount&offer/DiscountTrend";

export default function DiscountManagement() {
  const [activeTab, setActiveTab] = useState("all"); // State to manage active tab

  return (
    <motion.div
      className="p-10 pl-16 pr-1 min-h-screen bg-PrimaryColor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-2 text-ExtraDarkColor">
        Discount Management
      </h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b-2 mb-4 border-SecondaryColor">
        <div
          className={`cursor-pointer px-4 py-2 -mb-1 ${
            activeTab === "all"
              ? "border-b-4 border-DarkColor text-DarkColor"
              : "text-ExtraDarkColor"
          }`}
          onClick={() => setActiveTab("all")}
        >
          Manage Discount Items
        </div>
        <div
          className={`cursor-pointer px-4 py-2 -mb-1 ${
            activeTab === "add"
              ? "border-b-4 border-DarkColor text-DarkColor"
              : "text-ExtraDarkColor"
          }`}
          onClick={() => setActiveTab("add")}
        >
          Add Offer
        </div>
        <div
          className={`cursor-pointer px-4 py-2 -mb-1 ${
            activeTab === "retrieved"
              ? "border-b-4 border-DarkColor text-DarkColor"
              : "text-ExtraDarkColor"
          }`}
          onClick={() => setActiveTab("retrieved")}
        >
          Discount Items
        </div>
        <div
          className={`cursor-pointer px-4 py-2 -mb-1 ${
            activeTab === "trends"
              ? "border-b-4 border-DarkColor text-DarkColor"
              : "text-ExtraDarkColor"
          }`}
          onClick={() => setActiveTab("trends")}
        >
          Discount Trends
        </div>
      </div>

      {/* Render Tab Content with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          {activeTab === "all" && <DiscountTable />}
          {activeTab === "add" && <AddOffer />}
          {activeTab === "retrieved" && <ItemsforDiscount />}
          {activeTab === "trends" && <DiscountTrend />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}