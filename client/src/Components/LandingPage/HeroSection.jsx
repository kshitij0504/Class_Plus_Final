import { ArrowRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import main from "../../assets/Main-removebg-preview.png";

const HeroSection = () => {
  // Array of image URLs for group avatars
  const groupAvatars = [
    "https://img.freepik.com/premium-photo/3d-avatar-cartoon-character_113255-93124.jpg?semt=ais_hybrid",
    "https://img.freepik.com/free-psd/3d-illustration-with-online-avatar_23-2151303097.jpg?semt=ais_hybrid",
    "https://img.freepik.com/free-photo/androgynous-avatar-non-binary-queer-person_23-2151100221.jpg?semt=ais_hybrid",
    "https://img.freepik.com/premium-photo/3d-avatar-cartoon-character_113255-96896.jpg?semt=ais_hybrid",
    "https://img.freepik.com/premium-vector/market-researcher-vector-flat-style-illustration_1033579-70181.jpg?semt=ais_hybrid"
  ];

  return (
    <div className="relative pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900 to-gray-900" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Elevate Your
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                Learning{" "}
              </span>
              Journey
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Experience the future of collaborative learning with our Study
              Group Platform. Join a global community of learners and achieve
              excellence together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/signup"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 inline-flex items-center justify-center group"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#demo"
                className="bg-gray-800 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-700 transition-colors inline-flex items-center justify-center border border-purple-500/30"
              >
                Watch Demo
              </a>
            </div>
            <div className="mt-8 flex items-center justify-center md:justify-start space-x-8">
              <div className="flex -space-x-2">
                {groupAvatars.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Avatar ${index + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-purple-500/30"
                  />
                ))}
              </div>

              <div className="text-left">
                <div className="text-purple-400 font-bold">10,000+</div>
                <div className="text-gray-400 text-sm">Active Students</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl transform rotate-3 opacity-75" />
            <img
              src={main}
              alt="Students studying"
              className="relative rounded-3xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300 border border-purple-500/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
