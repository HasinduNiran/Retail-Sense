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
              className="w-6 h-6 rounded-full border border-gray-300 shadow-sm hover:scale-110 transition-transform"
              style={{ 
                backgroundColor: isValidColor(colorValue) ? colorValue : '#cccccc',
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
          <div
            key={index}
            className="w-6 h-6 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-xs font-medium text-purple-800 hover:scale-110 transition-transform"
            title={size}
          >
            {size}
          </div>
        ))}
      </div>
    );
  };

  const fetchRetrievedInventory = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY.RETRIEVED.ALL}`);
      
      // Process each item's colors and sizes
      const processedItems = response.data.map(item => {
        let colors = [];
        let sizes = [];

        // Process colors
        if (item.Colors) {
          if (typeof item.Colors === 'string') {
            try {
              // Try to parse if it's a JSON string
              const parsedColors = JSON.parse(item.Colors);
              colors = Array.isArray(parsedColors) ? parsedColors : [parsedColors];
            } catch {
              // If not JSON, split by comma and clean up
              colors = item.Colors
                .replace(/[[\]"']/g, '') // Remove brackets and quotes
                .split(',')
                .map(c => c.trim())
                .filter(c => c);
            }
          } else if (Array.isArray(item.Colors)) {
            colors = item.Colors;
          }
        }

        // Process sizes
        if (item.Sizes) {
          if (typeof item.Sizes === 'string') {
            try {
              // Try to parse if it's a JSON string
              const parsedSizes = JSON.parse(item.Sizes);
              sizes = Array.isArray(parsedSizes) ? parsedSizes : [parsedSizes];
            } catch {
              // If not JSON, split by comma and clean up
              sizes = item.Sizes
                .replace(/[[\]"']/g, '') // Remove brackets and quotes
                .split(',')
                .map(s => s.trim())
                .filter(s => s);
            }
          } else if (Array.isArray(item.Sizes)) {
            sizes = item.Sizes;
          }
        }

        // Clean up any remaining brackets or quotes
        colors = colors.map(c => c.replace(/[[\]"']/g, '').trim());
        sizes = sizes.map(s => s.replace(/[[\]"']/g, '').trim());

        // Log the processed data for debugging
        console.log('Original Colors:', item.Colors);
        console.log('Processed Colors:', colors);
        console.log('Original Sizes:', item.Sizes);
        console.log('Processed Sizes:', sizes);

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
      // First, get the current inventory quantity
      const inventoryResponse = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY.BASE}/${item.inventoryID}`
      );

      const currentInventory = inventoryResponse.data;
      const newQuantity = currentInventory.Quantity + item.retrievedQuantity;

      // Update the inventory with combined quantity
      await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY.BASE}/${item.inventoryID}/stock-status`,
        {
          action: 'update',
          Quantity: newQuantity
        }
      );

      // Then delete the retrieved item
      await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY.RETRIEVED.SINGLE(item._id)}`
      );

      // Update local state
      setRetrievedItems(prev => prev.filter(i => i._id !== item._id));

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Successfully reverted ${item.retrievedQuantity} items back to inventory`,
        confirmButtonColor: '#89198f',
      });
    } catch (error) {
      console.error('Error reverting item:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to revert item',
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
                    <td className="p-4">{item.unitPrice ? `Rs. ${item.unitPrice.toFixed(2)}` : '-'}</td>
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
        onSendToStore={async (item, unitPrice) => {
          try {
            await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY.BASE}/send-to-store/${item._id}`, {
              unitPrice: parseFloat(unitPrice)
            });
            
            // Update the unit price in the local state
            setRetrievedItems(prev =>
              prev.map(i =>
                i._id === item._id
                  ? { ...i, unitPrice: parseFloat(unitPrice) }
                  : i
              )
            );

            setIsModalOpen(false);
            setSelectedItem(null);

            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Unit price updated successfully',
              confirmButtonColor: '#89198f',
            });
          } catch (error) {
            console.error('Error updating unit price:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to update unit price',
              confirmButtonColor: '#89198f',
            });
          }
        }}
      />
    </motion.div>
  );
};

// SendToStoreModal component
const SendToStoreModal = ({ isOpen, onClose, item, onSendToStore }) => {
  const [unitPrice, setUnitPrice] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const price = parseFloat(unitPrice);
    if (isNaN(price) || price <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Price',
        text: 'Please enter a valid positive number for the unit price',
        confirmButtonColor: '#89198f',
      });
      return;
    }
    onSendToStore(item, price);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white rounded-lg p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Save Unit Price</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter unit price"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

SendToStoreModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.shape({
    _id: PropTypes.string,
    Name: PropTypes.string,
  }),
  onSendToStore: PropTypes.func.isRequired,
};

export default RetrievedInventoryTable;