import React, { useState } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SearchAndFilter = (
  searchTerm,
  setSearchTerm,
  fileType,
  setFileType,
  dateRange,
  setDateRange
) => {
  
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search files and folders..."
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-blue-500/30 rounded-lg 
                     text-white placeholder:text-blue-300 focus:outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <Select value={fileType} onValueChange={setFileType}>
          <SelectTrigger className="w-40 bg-gray-800 border-purple-500/30 text-white">
            <SelectValue placeholder="File Type" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-purple-500/30">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40 bg-gray-800 border-purple-500/30 text-white">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-purple-500/30">
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchAndFilter;
