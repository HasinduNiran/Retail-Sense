import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ClipLoader from 'react-spinners/ClipLoader';
import API_CONFIG from '../../config/apiConfig.js';

const RetrievedInventoryTable = () => {
  const [retrievedItems, setRetrievedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRetrievedInventory();
  }, []);

  const fetchRetrievedInventory = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/retrieved/all`);
      
      // Group items by ItemName and sum their quantities
      const groupedItems = response.data.reduce((acc, item) => {
        const existingItem = acc.find(i => i.ItemName === item.ItemName);
        if (existingItem) {
          existingItem.retrievedQuantity += item.retrievedQuantity;
          existingItem.retrievedDates.push(item.retrievedDate);
        } else {
          acc.push({
            ...item,
            retrievedDates: [item.retrievedDate]
          });
        }
        return acc;
      }, []);

      setRetrievedItems(groupedItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching retrieved inventory:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ClipLoader color="#89198f" size={50} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-PrimaryColor p-6 flex items-center justify-center"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-6xl border-2 border-SecondaryColor">
        <h2 className="text-2xl font-bold text-DarkColor mb-6">Retrieved Inventory History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-DarkColor">
            <thead className="bg-PrimaryColor text-DarkColor">
              <tr>
                <th className="p-4 font-semibold">Image</th>
                <th className="p-4 font-semibold">Item Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Total Retrieved</th>
                <th className="p-4 font-semibold">Brand</th>
                <th className="p-4 font-semibold">Gender</th>
                <th className="p-4 font-semibold">Style</th>
                <th className="p-4 font-semibold">Unit Price</th>
                <th className="p-4 font-semibold">Last Retrieved</th>
              </tr>
            </thead>
            <tbody>
              {retrievedItems.length > 0 ? (
                retrievedItems.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-SecondaryColor hover:bg-SecondaryColor/20"
                  >
                    <td className="p-4">
                      <img
                        src={`${API_CONFIG.BASE_URL}/${item.image}`}
                        alt={item.ItemName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="p-4">{item.ItemName}</td>
                    <td className="p-4">{item.Category}</td>
                    <td className="p-4">{item.retrievedQuantity}</td>
                    <td className="p-4">{item.Brand}</td>
                    <td className="p-4">{item.Gender}</td>
                    <td className="p-4">{item.Style}</td>
                    <td className="p-4">{item.unitPrice ? `$${item.unitPrice.toFixed(2)}` : 'N/A'}</td>
                    <td className="p-4">
                      {format(new Date(Math.max(...item.retrievedDates.map(date => new Date(date)))), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-gray-500">
                    No retrieved items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default RetrievedInventoryTable;