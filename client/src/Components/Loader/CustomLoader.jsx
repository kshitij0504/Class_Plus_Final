// CustomLoader.js
import React from "react";

const CustomLoader = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      <span className="ml-3 text-black text-lg font-semibold">Loading...</span>
    </div>
  );
};

export default CustomLoader;
