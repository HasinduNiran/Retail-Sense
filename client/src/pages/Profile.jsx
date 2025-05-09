import { useSelector, useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
import { app } from "../firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import {
  updateUserstart,
  updateUserFailure,
  updateUserSuccess,
  deleteUserFailure,
  deleteUserstart,
  deleteUserSuccess,
} from "../redux/user/userSlice";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserEdit,
  FaTrash,
  FaCheckCircle,
  FaSpinner,
  FaUser,
  FaShoppingBag,
  FaComment,
  FaTshirt,
  FaChevronRight,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_CONFIG from "../config/apiConfig.js";
import MyOrder1 from "../pages/order/Myorder1.jsx";
import Onefeedback from "../pages/feedback/Onefeedback.jsx";
import { getUserDesigns } from "../services/designService";
import { getUserCustomOrders } from "../services/customOrderService";
import { toast } from "react-toastify";

export default function Dashboard() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [designs, setDesigns] = useState([]);
  const [designsLoading, setDesignsLoading] = useState(false);
  const [designsError, setDesignsError] = useState(null);
  const [customOrders, setCustomOrders] = useState([]);
  const [customOrdersLoading, setCustomOrdersLoading] = useState(false);
  const [customOrdersError, setCustomOrdersError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        UserName: currentUser.UserName || "",
        email: currentUser.email || "",
        address: currentUser.address || "",
        mobile: currentUser.mobile || "",
        image: currentUser.image || "",
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  // Fetch designs and custom orders when their sections are active
  useEffect(() => {
    if (activeSection === "customized" && currentUser?._id) {
      // Fetch designs
      const fetchDesigns = async () => {
        setDesignsLoading(true);
        setDesignsError(null);
        try {
          const designsData = await getUserDesigns(currentUser._id);
          setDesigns(designsData);
        } catch (error) {
          setDesignsError(error.response?.data?.message || error.message);
          toast.error("Failed to load designs: " + (error.response?.data?.message || error.message));
        } finally {
          setDesignsLoading(false);
        }
      };
      
      // Fetch custom orders
      const fetchCustomOrders = async () => {
        setCustomOrdersLoading(true);
        setCustomOrdersError(null);
        try {
          const ordersData = await getUserCustomOrders(currentUser._id);
          setCustomOrders(ordersData);
        } catch (error) {
          setCustomOrdersError(error.response?.data?.message || error.message);
          toast.error("Failed to load custom orders: " + (error.response?.data?.message || error.message));
        } finally {
          setCustomOrdersLoading(false);
        }
      };
      
      fetchDesigns();
      fetchCustomOrders();
    }
  }, [activeSection, currentUser]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + "-" + file.name;
    const storageRef = ref(storage, `avatars/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({
            ...prev,
            image: downloadURL,
          }));
          setFileUploadError(false);
          setFilePerc(0);
          setFile(null);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserstart());

      const updateData = {
        UserName: formData.UserName,
        email: formData.email,
        address: formData.address || "",
        mobile: Number(formData.mobile) || 0,
        image: formData.image,
      };

      const res = await fetch(`${API_CONFIG.BASE_URL}/api/users/${currentUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!data.success) {
        dispatch(updateUserFailure(data.message));
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.message || "Failed to update profile",
        });
        return;
      }

      dispatch(updateUserSuccess(data.data));
      setUpdateSuccess(true);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Profile updated successfully",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  const handleDeleteUser = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#89198f",
      cancelButtonColor: "#f8abfc",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          dispatch(deleteUserstart());
          const res = await fetch(`${API_CONFIG.BASE_URL}/api/users/${currentUser._id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!data.success) {
            dispatch(deleteUserFailure(data.message));
            return;
          }
          dispatch(deleteUserSuccess(data));
          Swal.fire({
            title: "Deleted!",
            text: "Your account has been deleted.",
            icon: "success",
          });
        } catch (error) {
          dispatch(deleteUserFailure(error.message));
        }
      }
    });
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const navItems = [
    { id: "profile", label: "Customer Profile", icon: <FaUser /> },
    { id: "orders", label: "Orders", icon: <FaShoppingBag /> },
    { id: "feedbacks", label: "Feedbacks", icon: <FaComment /> },
    { id: "customized", label: "Customized Clothes", icon: <FaTshirt /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-PrimaryColor/30">
      <Navbar />

      <div className="flex flex-1 mt-16">
        {/* Left Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 bg-white shadow-lg rounded-r-3xl overflow-hidden"
        >
          <div className="relative">
            <div className="h-24 bg-gradient-to-r from-SecondaryColor to-DarkColor" />
            <div className="flex justify-center">
              <div className="absolute -bottom-12">
                <input
                  onChange={(e) => setFile(e.target.files[0])}
                  type="file"
                  ref={fileRef}
                  accept="image/*"
                  hidden
                />
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
                    <img
                      src={
                        formData.image ||
                        (currentUser.image?.startsWith("http")
                          ? currentUser.image
                          : `${API_CONFIG.BASE_URL}${currentUser.image}`) ||
                        "https://ui-avatars.com/api/?name=User&size=96&background=random"
                      }
                      alt="Profile"
                      className="rounded-full h-full w-full object-cover cursor-pointer border-2 border-SecondaryColor"
                      onClick={() => fileRef.current.click()}
                    />
                  </div>
                  {filePerc > 0 && filePerc < 100 && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                      <div className="text-white font-semibold">{filePerc}%</div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          <div className="pt-16 px-4">
            <p className="text-center font-semibold text-DarkColor">
              {fileUploadError ? (
                <span className="text-red-600">Error uploading image</span>
              ) : filePerc === 100 ? (
                <span className="text-green-600">Upload complete!</span>
              ) : (
                `${currentUser.UserName || "Customer"}`
              )}
            </p>
            <p className="text-center text-sm text-gray-500 mb-6">{currentUser.email}</p>

            <ul className="space-y-2 pb-8">
              {navItems.map((item) => (
                <motion.li
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  whileHover={{ x: 5 }}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                    activeSection === item.id
                      ? "bg-SecondaryColor/20 text-DarkColor font-medium"
                      : "text-gray-600 hover:bg-SecondaryColor/10"
                  }`}
                >
                  <div className={`${activeSection === item.id ? "text-DarkColor" : "text-SecondaryColor"}`}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                  {activeSection === item.id && (
                    <FaChevronRight className="ml-auto text-DarkColor" />
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Right Content Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 p-8"
        >
          <div className="bg-white rounded-3xl shadow-md p-8">
            <AnimatePresence mode="wait">
              {activeSection === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-3xl font-bold text-center mb-8 text-DarkColor">
                    Customer Profile
                  </h1>
                  <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          id="UserName"
                          placeholder="Username"
                          className="border border-gray-200 p-4 pl-5 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-SecondaryColor"
                          value={formData.UserName || ""}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          placeholder="Email"
                          className="border border-gray-200 p-4 pl-5 rounded-xl w-full bg-gray-50 focus:outline-none text-gray-500"
                          value={formData.email || ""}
                          readOnly
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          id="address"
                          placeholder="Address"
                          className="border border-gray-200 p-4 pl-5 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-SecondaryColor"
                          value={formData.address || ""}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          id="mobile"
                          placeholder="Mobile Number"
                          className="border border-gray-200 p-4 pl-5 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-SecondaryColor"
                          value={formData.mobile || ""}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full bg-gradient-to-r from-SecondaryColor to-DarkColor text-white p-4 rounded-xl flex items-center justify-center transition duration-300"
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                    >
                      {loading ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaUserEdit className="mr-2" />
                      )}
                      {loading ? "Updating..." : "Update Profile"}
                    </motion.button>

                    <motion.div
                      onClick={handleDeleteUser}
                      className="cursor-pointer w-full bg-red-500 text-white p-4 rounded-xl text-center hover:bg-red-600 transition duration-300"
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaTrash className="mr-2 inline" /> Delete Account
                    </motion.div>

                    {updateSuccess && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-green-600 bg-green-50 p-3 rounded-xl"
                      >
                        <FaCheckCircle className="inline mr-2" /> Profile updated successfully!
                      </motion.p>
                    )}

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-red-600 bg-red-50 p-3 rounded-xl"
                      >
                        <FaCheckCircle className="inline mr-2" /> {error}
                      </motion.p>
                    )}
                  </form>
                </motion.div>
              )}

              {activeSection === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <MyOrder1 />
                </motion.div>
              )}

              {activeSection === "feedbacks" && (
                <motion.div
                  key="feedbacks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <Onefeedback />
                </motion.div>
              )}

              {activeSection === "customized" && (
                <motion.div
                  key="customized"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <h1 className="text-3xl font-bold text-center mb-8 text-DarkColor">
                    Customized Clothes
                  </h1>

                  {/* Custom Orders Section */}
                  <div className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-DarkColor">My Custom Orders</h2>
                    {customOrdersLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <FaSpinner className="animate-spin text-SecondaryColor text-4xl" />
                      </div>
                    ) : customOrdersError ? (
                      <div className="text-center text-red-600 bg-red-50 p-4 rounded-xl">
                        <p>{customOrdersError}</p>
                      </div>
                    ) : customOrders.length === 0 ? (
                      <div className="bg-gray-50 rounded-xl p-8 text-center">
                        <p className="text-gray-500">You haven't placed any custom orders yet.</p>
                        <button 
                          onClick={() => navigate('/customize')}
                          className="mt-4 px-6 py-2 bg-SecondaryColor text-white rounded-lg hover:bg-DarkColor transition-colors"
                        >
                          Start Customizing
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {customOrders.map((order) => (
                          <div 
                            key={order._id}
                            className="bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col md:flex-row gap-4"
                          >
                            <div className="md:w-1/4">
                              <img 
                                src={order.imageUrl} 
                                alt={order.clothingType} 
                                className="w-full h-40 object-cover rounded-lg"
                              />
                            </div>
                            <div className="flex-1 flex flex-col">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold text-DarkColor capitalize">
                                    Custom {order.clothingType}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <p><span className="font-medium">Size:</span> {order.size}</p>
                                <p><span className="font-medium">Qty:</span> {order.quantity}</p>
                                <p><span className="font-medium">Price:</span> ${order.price?.toFixed(2)}</p>
                                {order.convertedToOrder && (
                                  <p className="text-green-600 font-medium">
                                    Converted to Order
                                  </p>
                                )}
                              </div>
                              {order.status === 'rejected' && (
                                <p className="mt-2 text-red-600 text-sm">
                                  <span className="font-medium">Reason:</span> {order.rejectionReason || 'No reason provided'}
                                </p>
                              )}
                              <div className="mt-auto pt-4">
                                {order.status === 'pending' && (
                                  <div className="text-gray-500 text-sm italic">
                                    Your order is being reviewed by our team.
                                  </div>
                                )}
                                {order.status === 'approved' && order.orderId && (
                                  <button className="text-SecondaryColor hover:underline text-sm font-medium">
                                    View Order #{order.orderId}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Saved Designs Section */}
                  <h2 className="text-2xl font-semibold mb-4 text-DarkColor">My Saved Designs</h2>
                  {designsLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <FaSpinner className="animate-spin text-SecondaryColor text-4xl" />
                    </div>
                  ) : designsError ? (
                    <div className="text-center text-red-600 bg-red-50 p-4 rounded-xl">
                      <p>{designsError}</p>
                    </div>
                  ) : designs.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <div className="text-DarkColor text-5xl mb-4 flex justify-center">
                        <FaTshirt />
                      </div>
                      <p className="text-center text-gray-500 max-w-md mx-auto">
                        No custom designs yet. Create your unique clothing items in the Customize section!
                      </p>
                      <button 
                        onClick={() => navigate('/customize')}
                        className="mt-4 px-6 py-2 bg-SecondaryColor text-white rounded-lg hover:bg-DarkColor transition-colors"
                      >
                        Create Design
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {designs.map((design) => (
                        <motion.div
                          key={design._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gray-50 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
                        >
                          <img
                            src={design.imageUrl}
                            alt={design.clothingType}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                          <h3 className="text-lg font-semibold text-DarkColor capitalize">
                            {design.clothingType}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                            {design.prompt}
                          </p>
                          <button 
                            onClick={() => navigate('/customize')}
                            className="w-full py-2 bg-SecondaryColor text-white rounded-lg hover:bg-DarkColor transition-colors"
                          >
                            Order This Design
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}