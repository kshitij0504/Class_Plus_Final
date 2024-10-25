import React from "react";

const stats = [
    { value: "10,000+", label: "Active Students" },
    { value: "5,000+", label: "Study Groups" },
    { value: "100,000+", label: "Study Sessions" },
    { value: "95%", label: "Success Rate" }
  ];
  
const StatsSection = () => {
    return ( 
        <div className="bg-purple-900/20 py-16 border-y border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center transform hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-purple-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
}

export default StatsSection