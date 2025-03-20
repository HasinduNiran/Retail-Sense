import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FiX } from 'react-icons/fi';
import { MdSend, MdRestartAlt } from 'react-icons/md';
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
      
      // Process each item's colors and sizes
      const processedItems = response.data.map(item => {
        let colors = [];
        let sizes = [];

        // Process colors
        if (item.Colors) {
          if (Array.isArray(item.Colors)) {
            colors = item.Colors;
          } else {
            try {
              colors = JSON.parse(item.Colors);
            } catch {
              colors = item.Colors
                .split(/[,[\]\\]/)
                .map(c => c.trim().replace(/["']/g, ''))
                .filter(c => c);
            }
          }
        }

        // Process sizes
        if (item.Sizes) {
          if (Array.isArray(item.Sizes)) {
            sizes = item.Sizes;
          } else {
            try {
              sizes = JSON.parse(item.Sizes);
            } catch {
              sizes = item.Sizes
                .split(/[,[\]\\]/)
                .map(s => s.trim().replace(/["']/g, ''))
                .filter(s => s);
            }
          }
        }

        return {
          ...item,
          colors,
          sizes,
          retrievedDate: item.retrievedDate || item.createdAt || new Date().toISOString()
        };
      });

      setRetrievedItems(processedItems);
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

  const handleRevert = async (item) => {
    try {
      // First, update the inventory quantity
      await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/${item.inventoryID}/stock-status`,
        {
          action: 'add',
          Quantity: item.retrievedQuantity
        }
      );

      // Then delete the retrieved item
      await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/retrieved/${item._id}`
      );

      // Update local state
      setRetrievedItems(prev => prev.filter(i => i._id !== item._id));

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Item reverted to inventory successfully!',
        confirmButtonColor: '#89198f',
      });
    } catch (error) {
      console.error('Error reverting item:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to revert item',
        confirmButtonColor: '#89198f',
      });
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-img.jpg';
    const relativePath = imagePath.replace(/.*uploads[/\\]/, 'uploads/');
    return `${API_CONFIG.BASE_URL}/${relativePath}`;
  };

  // Color validation helper
  const isValidColor = (color) => {
    const style = new Option().style;
    style.backgroundColor = color;
    return style.backgroundColor !== '';
  };

  // Color rendering logic
  const renderColors = (colors) => {
    if (!colors || !colors.length) return <span className="text-gray-500">-</span>;

    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        {colors.map((color, index) => {
          const colorValue = color.toLowerCase();
          const isLight = ['white', 'yellow', 'lime'].includes(colorValue);
          return (
            <div
              key={index}
              className="w-6 h-6 rounded-full border border-gray-300 shadow-sm flex items-center justify-center"
              style={{ 
                backgroundColor: isValidColor(colorValue) ? colorValue : '#e5e7eb',
                border: isLight ? '1px solid #d1d5db' : 'none'
              }}
              title={color}
            />
          );
        })}
      </div>
    );
  };

  // Size rendering logic
  const renderSizes = (sizes) => {
    if (!sizes || !sizes.length) return <span className="text-gray-500">-</span>;

    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        {sizes.map((size, index) => (
          <span
            key={index}
            className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full"
          >
            {size}
          </span>
        ))}
      </div>
    );
  };

  const handleSendToStore = async (item, unitPrice) => {
    try {
      // Update the unit price
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/send-to-store/${item._id}`,
        { unitPrice: parseFloat(unitPrice) }
      );

      if (response.status === 200) {
        // Update the item in the table with the new unit price
        setRetrievedItems(prev => 
          prev.map(i => i._id === item._id ? { ...i, unitPrice: parseFloat(unitPrice) } : i)
        );
      
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Unit price updated successfully!',
          confirmButtonColor: '#89198f',
        });

        // Close the modal
        setIsModalOpen(false);
        // Clear selected item
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error updating unit price:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update unit price',
        confirmButtonColor: '#89198f',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-purple-800 mb-6">Retrieved Inventory History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-700">
            <thead className="bg-purple-100 text-purple-800">
              <tr>
                <th className="p-4 font-semibold rounded-tl-lg">Image</th>
                <th className="p-4 font-semibold">Item Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Retrieved Qty</th>
                <th className="p-4 font-semibold">Brand</th>
                <th className="p-4 font-semibold">Style</th>
                <th className="p-4 font-semibold">Colors</th>
                <th className="p-4 font-semibold">Sizes</th>
                <th className="p-4 font-semibold">Unit Price</th>
                <th className="p-4 font-semibold">Retrieved Date</th>
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
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => { e.target.src = '/default-img.jpg' }}
                      />
                    </td>
                    <td className="p-4">{item.ItemName}</td>
                    <td className="p-4">{item.Category}</td>
                    <td className="p-4">{item.retrievedQuantity}</td>
                    <td className="p-4">{item.Brand || '-'}</td>
                    <td className="p-4">{item.Style || '-'}</td>
                    <td className="p-4">{renderColors(item.colors)}</td>
                    <td className="p-4">{renderSizes(item.sizes)}</td>
                    <td className="p-4">{item.unitPrice ? `$${item.unitPrice.toFixed(2)}` : '-'}</td>
                    <td className="p-4">
                      {format(new Date(item.retrievedDate), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-full transition-all duration-200 transform hover:scale-110"
                          title="Go to Popup"
                        >
                          <MdSend size={22} className="transform rotate-[-45deg]" />
                        </button>
                        <button
                          onClick={() => handleRevert(item)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-all duration-200 transform hover:scale-110"
                          title="Revert to Inventory"
                        >
                          <MdRestartAlt size={22} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-8 text-gray-500">
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

            <h2 className="text-2xl font-bold text-purple-800 mb-6 flex items-center">
              <span className="bg-purple-600 text-white p-2 rounded-full mr-3">
                <MdSend size={20} />
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
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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

export default RetrievedInventoryTable;