import Footer from "@/Components/LandingPage/Footer";
import { EnhancedCTA } from "@/Components/LandingPage/MultipleSection";
import Navigation from "@/Components/LandingPage/Navigation";
import { Check } from "lucide-react";
import React from "react";
import image from "../assets/Temp-removebg-preview.png";

const aboutVisionPoints = [
  "Creating inclusive learning environments for students worldwide",
  "Leveraging technology to make education more accessible",
  "Building communities that foster collaboration and growth",
  "Empowering students to achieve their academic goals",
];

const teamMembers = [
  {
    image: "/src/assets/My.jpeg",
    name: "Kshitij Oza",
    role: "Founder & CEO",
    bio: "Dedicated entrepreneur and visionary behind Class Plus, committed to creating a collaborative and engaging learning experience for students.",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      {/* Hero Section */}
      <div className="pt-32 pb-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Our Mission to Transform
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                Education{" "}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're building the future of collaborative learning, where
              students from around the world can connect, share knowledge, and
              achieve their academic goals together.
            </p>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl transform rotate-3 opacity-75" />
              <img
                src={image}
                alt="Team collaboration"
                className="relative rounded-3xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Vision</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                We envision a world where quality education knows no boundaries.
                Through our platform, we're breaking down traditional barriers
                to learning and creating opportunities for students to excel
                together.
              </p>
              <ul className="space-y-4">
                {aboutVisionPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Meet Our Founder
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Passionate about revolutionizing online learning.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-purple-500/30"
                />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-purple-400 mb-3">{member.role}</p>
                <p className="text-gray-300 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EnhancedCTA />
      <Footer />
    </div>
  );
};

export default AboutPage;
