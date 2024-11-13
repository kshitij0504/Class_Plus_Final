import React from "react";

const AvatarGroup = ({ participants }) => {
  const displayLimit = 4;
  const remainingCount = participants.length - displayLimit;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex -space-x-4">
      {participants.avatar ? (
        <>
          <img
            src={participants.avatar}
            alt={participant.name || "User avatar"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextElementSibling.style.display = "flex";
            }}
          />
          <div className="absolute inset-0 hidden bg-gradient-to-br from-indigo-400 to-purple-500 items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {getInitials(participant.name)}
            </span>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">
            {getInitials(participant.name)}
          </span>
        </div>
      )}
      {remainingCount > 0 && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-800 flex items-center justify-center transform hover:scale-110 transition-transform duration-200 hover:z-10">
          <span className="text-sm font-semibold text-white">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
