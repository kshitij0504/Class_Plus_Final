import React, { useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import animationData from "../../assets/Login_animation.json";
import { Button, Label, TextInput, Spinner } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import OAuth from "./OAuth";
import zxcvbn from "zxcvbn";
import PasswordStrengthBar from 'react-password-strength-bar';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const SignUp = () => {
  const [formdata, setFormdata] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormdata((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "password") {
      const result = zxcvbn(value);
      setPasswordStrength({
        score: result.score,
        feedback: result.feedback.suggestions.join(" "),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formdata.username || !formdata.email || !formdata.password) {
      return toast.error("Please fill out all fields.");
    }

    setLoading(true);

    try {
      const URL = `http://localhost:8000/api/signup`;
      const response = await axios.post(URL, formdata);
      toast.success(response.data.message);

      if (response.data.success) {
        setFormdata({
          username: "",
          email: "",
          password: "",
        });
        navigate("/otp", { state: { email: formdata.email } });
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4 sm:px-6 lg:px-8 font-poppins">
      <motion.div
        className="flex flex-col md:flex-row items-center md:items-start p-6 sm:p-8 max-w-full sm:max-w-xl md:max-w-4xl w-full bg-gray-800 rounded-lg shadow-lg gap-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex-1 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80">
            <Lottie
              animationData={animationData}
              loop={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <p className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mt-2 sm:mt-4 lg:mt-6">
            {getGreeting()}, Welcome to Class Plus
          </p>
          <p className="text-xs sm:text-sm lg:text-base font-medium mt-2 text-white">
            Join us in a journey of knowledge and growth.
          </p>
        </motion.div>
        <motion.div
          className="flex-1 w-full mt-8 md:mt-0"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Label htmlFor="username" className="text-white">
              Enter Your Username
            </Label>
            <TextInput
              type="text"
              placeholder="Username"
              id="username"
              name="username"
              onChange={handleChange}
              value={formdata.username}
              autoComplete="username"
              className="rounded-lg"
            />
            <Label htmlFor="email" className="text-white">
              Enter Your Email
            </Label>
            <TextInput
              type="email"
              placeholder="Email"
              id="email"
              name="email"
              onChange={handleChange}
              value={formdata.email}
              autoComplete="email"
              className="rounded-lg"
            />
            <Label htmlFor="password" className="text-white">
              Enter Your Password
            </Label>
            <TextInput
              type="password"
              placeholder="Password"
              id="password"
              name="password"
              onChange={handleChange}
              value={formdata.password}
              autoComplete="password"
              className="rounded-lg"
            />

            {/* Password Strength Display */}
            <div className="mt-2">
              <PasswordStrengthBar
                password={formdata.password}
                scoreWord={["Weak", "Fair", "Good", "Strong", "Very Strong"]}
                shortScoreWord="Weak"
                minLength={8}
                scoreWords={["Weak", "Fair", "Good", "Strong", "Very Strong"]}
              />
              {passwordStrength.feedback && (
                <div className="mt-2 text-sm text-gray-400">
                  {passwordStrength.feedback}
                </div>
              )}
            </div>

            <Button pill type="submit" disabled={loading} className="mt-4">
              {loading ? <Spinner size="lg" /> : "Sign Up"}
            </Button>
          </form>

          <OAuth />

          <motion.div
            className="flex gap-2 text-sm mt-5 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <span className="text-lg">Have an account?</span>
            <Link to="/SignIn" className="text-blue-500 text-lg">
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUp;
