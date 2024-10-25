import { ArrowRight, Search, Users, Video } from "lucide-react";
import React from "react";

const steps = [
    {
      icon: <Users className="w-6 h-6 text-purple-400" />,
      title: "Create Your Profile",
      description: "Sign up and customize your learning preferences and subjects of interest."
    },
    {
      icon: <Search className="w-6 h-6 text-purple-400" />,
      title: "Find Your Group",
      description: "Join existing study groups or create your own based on your courses."
    },
    {
      icon: <Video className="w-6 h-6 text-purple-400" />,
      title: "Start Learning",
      description: "Connect with peers, schedule sessions, and achieve your goals together."
    }
  ];
const HowItWorksSection = () => {
    return (
      <div className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Get started with Class Plus in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-700/50 rounded-2xl p-8 border border-purple-500/30 h-full">
                  <div className="w-12 h-12 bg-purple-900/50 rounded-xl flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2 text-purple-400 w-8 h-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
export default HowItWorksSection