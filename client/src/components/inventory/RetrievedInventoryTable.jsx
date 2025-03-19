import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FiX, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';
import PropTypes from 'prop-types';

const RetrievedInventoryTable = () => {
  const [retrievedItems, setRetrievedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRetrievedInventory = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/retrieved/all`);
      const groupedItems = response.data.reduce((acc, item) => {
        const existingItem = acc.find(i => i.ItemName === item.ItemName);
        if (existingItem) {
          existingItem.retrievedQuantity += item.retrievedQuantity;
          existingItem.retrievedDates.push(item.retrievedDate);
        } else {
          acc.push({
            ...item,
            retrievedDates: [item.retrievedDate],
          });
        }
        return acc;
      }, []);
      
      setRetrievedItems(groupedItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching retrieved inventory:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch retrieved inventory',
        confirmButtonColor: '#89198f',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetrievedInventory();
  }, []);

  const handleSendToStore = async (item, unitPrice) => {
    try {
      // First, update the unit price and mark as in-stock
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/send-to-store/${item._id}`,
        { unitPrice: parseFloat(unitPrice) }
      );

      if (response.status === 200) {
        // Then update the stock status and quantity
        await axios.put(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/${item.inventoryID}/stock-status`,
          {
            action: 'send-to-store',
            Quantity: item.retrievedQuantity // Set quantity to the retrieved amount
          }
        );

        // Remove item from retrieved items list in UI
        setRetrievedItems(prev => 
          prev.filter(i => i._id !== item._id)
        );
      
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Item sent to store successfully!',
          confirmButtonColor: '#89198f',
        });

        // Close the modal
        setIsModalOpen(false);
        // Clear selected item
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error sending item to store:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to send item to store',
        confirmButtonColor: '#89198f',
      });
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-img.jpg';
    const relativePath = imagePath.replace(/.*uploads[/\\]/, 'uploads/');
    return `${API_CONFIG.BASE_URL}/${relativePath}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DarkColor"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-PrimaryColor to-SecondaryColor p-6"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-ExtraDarkColor mb-6">Retrieved Inventory History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-700">
            <thead className="bg-PrimaryColor text-ExtraDarkColor">
              <tr>
                <th className="p-4 font-semibold rounded-tl-lg">Image</th>
                <th className="p-4 font-semibold">Item Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Retrieved Qty</th>
                <th className="p-4 font-semibold">Brand</th>
                <th className="p-4 font-semibold">Style</th>
                <th className="p-4 font-semibold">Unit Price</th>
                <th className="p-4 font-semibold">Last Retrieved</th>
                <th className="p-4 font-semibold rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {retrievedItems.length > 0 ? (
                retrievedItems.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.ItemName}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        onError={(e) => { e.target.src = '/default-img.jpg' }}
                      />
                    </td>
                    <td className="p-4 font-medium">{item.ItemName}</td>
                    <td className="p-4">{item.Category}</td>
                    <td className="p-4">{item.retrievedQuantity}</td>
                    <td className="p-4">{item.Brand}</td>
                    <td className="p-4">{item.Style}</td>
                    <td className="p-4">{item.unitPrice ? `$${parseFloat(item.unitPrice).toFixed(2)}` : '-'}</td>
                    <td className="p-4">
                      {format(new Date(Math.max(...item.retrievedDates.map(date => new Date(date)))), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsModalOpen(true);
                        }}
                        className="bg-DarkColor text-white px-4 py-2 rounded-lg hover:bg-ExtraDarkColor transition-colors focus:outline-none focus:ring-2 focus:ring-DarkColor focus:ring-offset-2"
                      >
                        Goto Popup
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">
                    No retrieved items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SendToStoreModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSendToStore={handleSendToStore}
      />
    </motion.div>
  );
};

const SendToStoreModal = ({ isOpen, onClose, item, onSendToStore }) => {
  const [unitPrice, setUnitPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  SendToStoreModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    item: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      ItemName: PropTypes.string.isRequired,
      Category: PropTypes.string,
      retrievedQuantity: PropTypes.number,
      image: PropTypes.string,
    }),
    onSendToStore: PropTypes.func.isRequired,
  };

  const handleSubmit = async () => {
    if (!unitPrice || isNaN(unitPrice) || parseFloat(unitPrice) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Unit Price',
        text: 'Please enter a valid positive number for unit price',
        confirmButtonColor: '#89198f',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSendToStore(item, unitPrice);
      setUnitPrice('');
    } catch (error) {
      console.error('Error in modal submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>

            <h2 className="text-2xl font-bold text-ExtraDarkColor mb-6 flex items-center">
              <span className="bg-DarkColor text-white p-2 rounded-full mr-3">
                <FiPlus size={20} />
              </span>
              Save
            </h2>

            <div className="mb-6 flex items-start gap-4">
              <img
                src={item.image ? `${API_CONFIG.BASE_URL}/${item.image}` : '/default-img.jpg'}
                alt={item.ItemName}
                className="w-20 h-20 object-cover rounded-lg shadow-sm"
                onError={(e) => { e.target.src = '/default-img.jpg' }}
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.ItemName}</h3>
                <p className="text-gray-600">Category: {item.Category}</p>
                <p className="text-gray-600">Retrieved Quantity: {item.retrievedQuantity}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price *
              </label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-DarkColor focus:border-DarkColor transition-colors"
                placeholder="Enter unit price"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-DarkColor text-white py-2 px-4 rounded-lg hover:bg-ExtraDarkColor transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-DarkColor focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Send to Store'
                )}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RetrievedInventoryTable;