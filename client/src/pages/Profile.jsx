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
import Onefeedback from "../pages/feedback/Onefeedback.jsx"; // Import the Onefeedback component

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
                        "https://via.placeholder.com/96"
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

              {activeSection === "feedbacks" && ( // Note: Match the navItems id
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
                  className="min-h-96 flex flex-col items-center justify-center"
                >
                  <div className="text-DarkColor text-5xl mb-4">
                    <FaTshirt />
                  </div>
                  <h1 className="text-3xl font-bold text-center mb-3 text-DarkColor">
                    Customized Clothes
                  </h1>
                  <p className="text-center text-gray-500 max-w-md">
                    Design your unique clothing items. Express your personality through custom fashion.
                  </p>
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