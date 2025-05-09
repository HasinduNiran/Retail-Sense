import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createCustomOrder } from '../../services/customOrderService';
import Swal from 'sweetalert2';

const CustomOrderForm = ({ designData, onCancel }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    size: 'M',
    quantity: 1,
    specialInstructions: '',
    customerInfo: {
      name: '',
      email: '',
      mobile: ''
    },
    deliveryInfo: {
      address: '',
      city: '',
      postalCode: ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic form validation
      if (!formData.customerInfo.name || !formData.customerInfo.email || !formData.customerInfo.mobile) {
        toast.error('Please fill in all customer information fields');
        setIsLoading(false);
        return;
      }

      if (!formData.deliveryInfo.address || !formData.deliveryInfo.city || !formData.deliveryInfo.postalCode) {
        toast.error('Please fill in all delivery information fields');
        setIsLoading(false);
        return;
      }

      // Create the order data object
      const orderData = {
        userId: designData.userId,
        imageUrl: designData.imageUrl,
        clothingType: designData.clothingType,
        prompt: designData.prompt,
        size: formData.size,
        quantity: formData.quantity,
        specialInstructions: formData.specialInstructions,
        customerInfo: formData.customerInfo,
        deliveryInfo: formData.deliveryInfo
      };

      // Only include designId if it exists and is valid
      if (designData.designId) {
        orderData.designId = designData.designId;
      }

      const response = await createCustomOrder(orderData);
      
      setIsLoading(false);
      
      Swal.fire({
        title: 'Order Submitted!',
        text: 'Your custom design order has been submitted for review. We will contact you once it is approved.',
        icon: 'success',
        confirmButtonText: 'View My Orders',
        showCancelButton: true,
        cancelButtonText: 'Continue Shopping'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/profile');
        } else {
          navigate('/');
        }
      });
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Failed to submit order');
      console.error('Order submission error:', error);
    }
  };
  
  // Calculate price based on clothing type
  const getBasePrice = () => {
    switch (designData.clothingType) {
      case 'tshirt': return 25.99;
      case 'dress': return 45.99;
      case 'pants': return 35.99;
      case 'jacket': return 55.99;
      default: return 30.00;
    }
  };
  
  const basePrice = getBasePrice();
  const totalPrice = basePrice * formData.quantity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-DarkColor mb-2">Complete Your Custom Order</h2>
        <p className="text-gray-600">Please provide the details to complete your custom design order.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-2">Design Summary</h3>
            <div className="flex items-center gap-4">
              <img 
                src={designData.imageUrl} 
                alt="Custom Design" 
                className="w-24 h-24 object-cover rounded-md" 
              />
              <div>
                <p className="font-medium">Custom {designData.clothingType.charAt(0).toUpperCase() + designData.clothingType.slice(1)}</p>
                <p className="text-sm text-gray-600">{designData.prompt.substring(0, 60)}...</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-SecondaryColor focus:border-transparent"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                    className="p-2 bg-gray-200 rounded-l-md hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-20 p-2 text-center border-t border-b border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                    className="p-2 bg-gray-200 rounded-r-md hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-SecondaryColor focus:border-transparent h-24"
                  placeholder="Any special requirements or notes for your design..."
                />
              </div>
            </div>
          </form>
        </div>

        <div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="customerInfo.name"
                value={formData.customerInfo.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-SecondaryColor focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="customerInfo.email"
                value={formData.customerInfo.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-SecondaryColor focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                name="customerInfo.mobile"
                value={formData.customerInfo.mobile}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-SecondaryColor focus:border-transparent"
                required
              />
            </div>

            <h3 className="font-semibold text-lg pt-2">Delivery Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="deliveryInfo.address"
                value={formData.deliveryInfo.address}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-SecondaryColor focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="deliveryInfo.city"
                value={formData.deliveryInfo.city}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-SecondaryColor focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="deliveryInfo.postalCode"
                value={formData.deliveryInfo.postalCode}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-SecondaryColor focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between mb-2">
          <span>Base price:</span>
          <span>${basePrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Quantity:</span>
          <span>× {formData.quantity}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total price:</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading}
          className={`px-6 py-2 bg-SecondaryColor text-white rounded-md hover:bg-DarkColor transition-colors ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Submitting...' : 'Submit Order'}
        </button>
      </div>
    </motion.div>
  );
};

export default CustomOrderForm;
