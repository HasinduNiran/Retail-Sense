import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FiX, FiPlus, FiEdit } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig'; // Adjust path as needed
import PropTypes from 'prop-types';

const DiscountTable = () => {
  const [retrievedItems, setRetrievedItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch RetrievedInventory and Promotions
  const fetchData = async () => {
    try {
      const retrievedResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/inventory/retrieved/all`);
      console.log('Retrieved Response:', retrievedResponse.data);
      const retrievedData = retrievedResponse.data.data || retrievedResponse.data || [];
      const parsedItems = retrievedData.map(item => {
        const sizesString = item.Sizes ? item.Sizes.join('') : '[]';
        const colorsString = item.Colors ? item.Colors.join('') : '[]';
        const cleanSizesString = sizesString.replace(/\\/g, '').replace(/^\[|\]$/g, '');
        const cleanColorsString = colorsString.replace(/\\/g, '').replace(/^\[|\]$/g, '');
        const sizes = cleanSizesString ? cleanSizesString.split(',') : [];
        const colors = cleanColorsString ? cleanColorsString.split(',') : [];
        return { ...item, Sizes: sizes, Colors: colors };
      });
      setRetrievedItems(parsedItems);

      const promotionResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/promotions`);
      console.log('Promotions Response:', promotionResponse.data);
      const promotionData = promotionResponse.data.data || promotionResponse.data || [];
      setPromotions(promotionData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch data',
        confirmButtonColor: '#89198f',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get promotion details for a specific item
  const getItemPromotion = (itemId) => {
    const itemIdStr = itemId.toString();
    const promo = promotions.find(promo => {
      // Check if applicableProducts contains the itemId, handling objects or strings
      const hasProduct = promo.applicableProducts.some(product => {
        // If product is an object (e.g., RetrievedInventory), use _id; otherwise, use the value directly
        const productId = typeof product === 'object' && product._id ? product._id.toString() : product.toString();
        return productId === itemIdStr;
      });
      console.log(`Checking promotion for item ${itemIdStr}:`, promo, 'Applicable Products:', promo?.applicableProducts);
      return hasProduct;
    });
    return promo || null;
  };

  // Handle adding/updating a promotion
  const handleAddDiscount = async (item, discountData) => {
    try {
      const existingPromo = getItemPromotion(item._id);
      const url = existingPromo
        ? `${API_CONFIG.BASE_URL}/api/promotions/${existingPromo.promotionID}`
        : `${API_CONFIG.BASE_URL}/api/promotions`;
      const method = existingPromo ? 'put' : 'post';

      // Calculate finalPrice based on discount type and amount
      let finalPrice = item.unitPrice || 0;
      if (discountData.discountType === 'flat' && discountData.discountValue) {
        finalPrice = Math.max(0, finalPrice - parseFloat(discountData.discountValue));
      } else if (discountData.discountType === 'percentage' && discountData.discountPercentage) {
        const discountAmount = (finalPrice * parseFloat(discountData.discountPercentage)) / 100;
        finalPrice = Math.max(0, finalPrice - discountAmount);
      }

      // Ensure finalPrice is a valid number
      finalPrice = isNaN(finalPrice) ? 0 : finalPrice;
      
      console.log('Calculated finalPrice:', finalPrice);

      const promotionData = {
        promotionID: existingPromo ? existingPromo.promotionID : Date.now(),
        type: discountData.type,
        discountValue: discountData.discountType === 'flat' ? parseFloat(discountData.discountValue) : undefined,
        discountPercentage: discountData.discountType === 'percentage' ? parseFloat(discountData.discountPercentage) : undefined,
        discountType: discountData.discountType,
        validUntil: discountData.validUntil,
        promoCode: discountData.promoCode || `DISC${item.inventoryID}`,
        applicableProducts: [item._id],
        minimumPurchase: parseFloat(discountData.minimumPurchase) || 0,
      };

      const response = await axios({
        method,
        url,
        data: promotionData,
      });

      console.log('Discount Response:', response.data);

      // Update the finalPrice in RetrievedInventory - ensure we're sending valid JSON
      try {
        const finalPriceResponse = await axios.put(
          `${API_CONFIG.BASE_URL}/api/inventory/retrieved/${item._id}`, 
          { finalPrice: finalPrice }
        );
        console.log('Final price update response:', finalPriceResponse.data);
      } catch (finalPriceError) {
        console.error('Error updating final price:', finalPriceError);
        console.log('Error details:', finalPriceError.response?.data);
      }

      const newPromo = response.data.data || response.data;
      if (method === 'post') {
        setPromotions(prev => [...prev, newPromo]);
      } else {
        setPromotions(prev =>
          prev.map(p => (p.promotionID === existingPromo.promotionID ? newPromo : p))
        );
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Discount ${existingPromo ? 'updated' : 'added'} successfully!`,
        confirmButtonColor: '#89198f',
      });

      await fetchData();

      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error managing discount:', error);
      console.log('Error details:', error.response?.data);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to manage discount',
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
        <h2 className="text-2xl font-bold text-purple-800 mb-6">Discount Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-700">
            <thead className="bg-purple-100 text-purple-800">
              <tr>
                <th className="p-4 font-semibold rounded-tl-lg">Image</th>
                <th className="p-4 font-semibold">Item Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Quantity</th>
                <th className="p-4 font-semibold">Unit Price</th>
                <th className="p-4 font-semibold">Current Discount</th>
                <th className="p-4 font-semibold rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {retrievedItems.length > 0 ? (
                retrievedItems.map((item) => {
                  const promo = getItemPromotion(item._id);
                  const discountAmount =
                    promo?.discountType === 'flat'
                      ? promo.discountValue || 0
                      : promo?.discountType === 'percentage' && item.unitPrice
                      ? (item.unitPrice * (promo.discountPercentage || 0)) / 100
                      : 0;

                  return (
                    <tr
                      key={item._id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.ItemName}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => { e.target.src = '/default-img.jpg'; }}
                        />
                      </td>
                      <td className="p-4">{item.ItemName}</td>
                      <td className="p-4">{item.Category}</td>
                      <td className="p-4">{item.retrievedQuantity}</td>
                      <td className="p-4">{item.unitPrice ? `$${item.unitPrice.toFixed(2)}` : '-'}</td>
                      <td className="p-4">
                        {promo ? (
                          <div className="text-green-600">
                            <span>
                              {promo.discountType === 'flat'
                                ? `$${promo.discountValue || 0} off`
                                : `${promo.discountPercentage || 0}% off`}
                            </span>
                            <span className="block text-sm text-gray-600">
                              Discount Amount: ${discountAmount.toFixed(2)}
                            </span>
                            <span className="block text-sm text-purple-600 font-semibold">
                              Final Price: ${item.finalPrice ? item.finalPrice.toFixed(2) : (item.unitPrice - discountAmount).toFixed(2)}
                            </span>
                            {promo.validUntil && (
                              <span className="block text-sm text-gray-500">
                                Until: {format(new Date(promo.validUntil), 'MMM dd, yyyy')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">No discount</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                          title={promo ? 'Edit Discount' : 'Add Discount'}
                        >
                          {promo ? <FiEdit size={20} /> : <FiPlus size={20} />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No retrieved items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DiscountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onAddDiscount={handleAddDiscount}
        existingPromo={selectedItem ? getItemPromotion(selectedItem?._id) : null}
      />
    </motion.div>
  );
};

const DiscountModal = ({ isOpen, onClose, item, onAddDiscount, existingPromo }) => {
  const [discountData, setDiscountData] = useState({
    type: existingPromo?.type || 'Discount Code',
    discountValue: existingPromo?.discountValue || '',
    discountPercentage: existingPromo?.discountPercentage || '',
    discountType: existingPromo?.discountType || 'flat',
    validUntil: existingPromo?.validUntil
      ? format(new Date(existingPromo.validUntil), "yyyy-MM-dd'T'HH:mm")
      : '',
    promoCode: existingPromo?.promoCode || '',
    minimumPurchase: existingPromo?.minimumPurchase || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDiscountData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      (discountData.discountType === 'flat' && (!discountData.discountValue || parseFloat(discountData.discountValue) <= 0)) ||
      (discountData.discountType === 'percentage' && (!discountData.discountPercentage || parseFloat(discountData.discountPercentage) <= 0)) ||
      !discountData.validUntil
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Please fill in all required fields with valid values',
        confirmButtonColor: '#89198f',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddDiscount(item, discountData);
      setDiscountData({
        type: 'Discount Code',
        discountValue: '',
        discountPercentage: '',
        discountType: 'flat',
        validUntil: '',
        promoCode: '',
        minimumPurchase: '',
      });
    } catch (error) {
      console.error('Error in discount submit:', error);
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
                <FiPlus size={20} />
              </span>
              {existingPromo ? 'Edit Discount' : 'Add Discount'}
            </h2>

            <div className="mb-6 flex items-start gap-4">
              <img
                src={item.image ? `${API_CONFIG.BASE_URL}/${item.image}` : '/default-img.jpg'}
                alt={item.ItemName}
                className="w-20 h-20 object-cover rounded-lg shadow-sm"
                onError={(e) => { e.target.src = '/default-img.jpg'; }}
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.ItemName}</h3>
                <p className="text-gray-600">Category: {item.Category}</p>
                <p className="text-gray-600">Price: {item.unitPrice ? `$${item.unitPrice.toFixed(2)}` : '-'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Promotion Type</label>
                <select
                  name="type"
                  value={discountData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Discount Code">Discount Code</option>
                  <option value="Loyalty">Loyalty</option>
                  <option value="Flash Sale">Flash Sale</option>
                  <option value="Bundle">Bundle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <select
                  name="discountType"
                  value={discountData.discountType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="flat">Flat Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>

              {discountData.discountType === 'flat' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Amount *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={discountData.discountValue}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter amount (e.g., 5)"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage *</label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={discountData.discountPercentage}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter percentage (e.g., 10)"
                    min="0"
                    max="100"
                    step="1"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until *</label>
                <input
                  type="datetime-local"
                  name="validUntil"
                  value={discountData.validUntil}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                <input
                  type="text"
                  name="promoCode"
                  value={discountData.promoCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter promo code (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Purchase</label>
                <input
                  type="number"
                  name="minimumPurchase"
                  value={discountData.minimumPurchase}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter minimum purchase (optional)"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {isSubmitting ? 'Saving...' : 'Save Discount'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

DiscountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    ItemName: PropTypes.string.isRequired,
    Category: PropTypes.string,
    unitPrice: PropTypes.number,
    image: PropTypes.string,
  }),
  onAddDiscount: PropTypes.func.isRequired,
  existingPromo: PropTypes.object,
};

export default DiscountTable;