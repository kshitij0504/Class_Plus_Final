import { Alert, Button, TextInput, ToggleSwitch, Tabs } from "flowbite-react";
import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getStorage,
  getDownloadURL,
  uploadBytesResumable,
  ref,
} from "firebase/storage";
import { HiAdjustments, HiClipboardList, HiUserCircle } from "react-icons/hi";
import { MdDashboard, MdSecurity, MdSettings, MdNotifications } from "react-icons/md";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  updateStart,
  updateFailure,
  updateSuccess,
} from "../redux/user/userSlice";
import axios from "axios";

const UpdateProfile = () => {
  const { currentUser } = useSelector((state) => state.user || {});
  const [imageFile, setImageFile] = useState(null);
  const [imageFileURL, setImageFileURL] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const filePickerRef = useRef();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileURL(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError("File upload failed");
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileURL(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileURL(downloadURL);
          setFormData({ ...formData, avatar: downloadURL });
          setImageFileUploadProgress(null);
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(formData).length === 0) {
      return;
    }

    try {
      dispatch(updateStart());
      const URL = `https://class-plus-final.onrender.com/api/update/${currentUser.id}`;
      const response = await axios.put(URL, formData, {
        withCredentials: true,
      });
      if (response.status !== 200) {
        dispatch(updateFailure(response.data.message));
      } else {
        dispatch(updateSuccess(response.data));
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
    }
  };

  const handleNotificationChange = (e) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [e.target.name]: e.target.checked,
    });
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-900 text-black"
      } flex flex-col items-center`}
    >
      <div className="max-w-4xl w-full p-6 space-y-8 mx-auto sm:p-4 md:max-w-3xl lg:max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Update Your Profile
        </h1>
        <div className="overflow-x-auto pb-2">
        <Tabs aria-label="Profile Settings Tabs" variant="underline"  className="flex whitespace-nowrap min-w-max"> 
          <Tabs.Item active title="Profile" icon={HiUserCircle}>
            <section className={`p-6 bg-gray-800 rounded-lg shadow-lg mb-8`}>
              <h2 className="text-white text-2xl font-semibold mb-4">
                Profile Information
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={filePickerRef}
                  hidden
                />
                <div
                  className="relative w-32 h-32 sm:w-24 sm:h-24 lg:w-40 lg:h-40 self-center cursor-pointer overflow-hidden rounded-full"
                  onClick={() => filePickerRef.current.click()}
                >
                  {imageFileUploadProgress && (
                    <CircularProgressbar
                      value={imageFileUploadProgress || 0}
                      text={`${imageFileUploadProgress}%`}
                      strokeWidth={5}
                      styles={{
                        root: {
                          width: "100%",
                          height: "100%",
                          position: "absolute",
                          top: 0,
                          left: 0,
                        },
                        path: {
                          stroke: `rgba(62,152,199,${
                            imageFileUploadProgress / 100
                          })`,
                        },
                      }}
                    />
                  )}
                  <img
                    src={imageFileURL || currentUser.avatar}
                    alt="user"
                    className={`rounded-full w-full h-full object-cover border-4 border-gray-300 ${
                      imageFileUploadProgress &&
                      imageFileUploadProgress < 100 &&
                      "opacity-60"
                    }`}
                  />
                </div>
                {imageFileUploadError && (
                  <Alert color="failure">{imageFileUploadError}</Alert>
                )}
                <TextInput
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Username"
                  defaultValue={currentUser.username}
                  onChange={handleChange}
                  className="bg-gray-700 text-white"
                />
                <TextInput
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  defaultValue={currentUser.email}
                  onChange={handleChange}
                  className="bg-gray-700 text-white"
                />
                <Button
                  pill
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Update Profile
                </Button>
              </form>
            </section>
          </Tabs.Item>
          <Tabs.Item title="Security" icon={MdSecurity}>
            <section className={`p-6 bg-gray-800 rounded-lg shadow-lg mb-8`}>
              <h2 className="text-white text-2xl font-semibold mb-4">
                Password Management
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <TextInput
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  placeholder="Current Password"
                  onChange={handleChange}
                  className="bg-gray-700 text-white"
                />
                <TextInput
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  placeholder="New Password"
                  onChange={handleChange}
                  className="bg-gray-700 text-white"
                />
                <TextInput
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  className="bg-gray-700 text-white"
                />
                <Button
                  pill
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Update Password
                </Button>
              </form>
            </section>
          </Tabs.Item>
          <Tabs.Item title="Settings" icon={MdSettings}>
            <section className={`p-6 bg-gray-800 rounded-lg shadow-lg mb-8`}>
              <h2 className="text-white text-2xl font-semibold mb-4">
                Connected Accounts
              </h2>
              <div className="space-y-4">
                <Button
                  pill
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => alert("Link Google Account")}
                >
                  Link Google Account
                </Button>
                <Button
                  pill
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => alert("Link Facebook Account")}
                >
                  Link Facebook Account
                </Button>
              </div>
            </section>
          </Tabs.Item>
          <Tabs.Item title="Notification" icon={MdNotifications}>
            <section className={`p-6 bg-gray-800 rounded-lg shadow-lg mb-8`}>
              <h2 className="text-white text-2xl font-semibold mb-4">
                Notification Preferences
              </h2>
              <form className="flex flex-col gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="email"
                    checked={notificationPreferences.email}
                    onChange={handleNotificationChange}
                    className="mr-2"
                  />
                  <label htmlFor="email" className="text-white">
                    Email Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sms"
                    checked={notificationPreferences.sms}
                    onChange={handleNotificationChange}
                    className="mr-2"
                  />
                  <label htmlFor="sms" className="text-white">
                    SMS Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="push"
                    checked={notificationPreferences.push}
                    onChange={handleNotificationChange}
                    className="mr-2"
                  />
                  <label htmlFor="push" className="text-white">
                    Push Notifications
                  </label>
                </div>
                <Button
                  pill
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Save Preferences
                </Button>
              </form>
            </section>
          </Tabs.Item>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
