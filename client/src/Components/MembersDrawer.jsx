import React from "react"; // Adjust path according to your project structure
import { Avatar, Badge, Button } from "flowbite-react"; // Example using Flowbite's Button component
const MemberCard = ({ member, isLeader }) => (
    <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
      <Avatar img={member.avatar} rounded size="lg" />
      <div>
        <p className="text-lg font-semibold">{member.username || member.email}</p>
        <Badge color={isLeader ? "info" : "gray"} className="mt-1">
          {isLeader ? "Leader" : "Member"}
        </Badge>
      </div>
    </div>
  );
const MembersDrawer = ({ show, handleClose, members, groupLeaderId }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
             onClick={handleClose}>
        </div>
        
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-gray-800 shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 bg-gray-700 sm:px-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Group Members</h2>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white focus:outline-none"
                  >
                    <span className="sr-only">Close panel</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Main content */}
              <div className="relative flex-1 overflow-y-auto px-4 py-6">
                <div className="space-y-4">
                  {members && members.length > 0 ? (
                    members.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        isLeader={member.id === groupLeaderId}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      No members found
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-4 py-4 bg-gray-700">
                <div className="flex justify-end">
                  <Button
                    color="gray"
                    onClick={handleClose}
                    className="w-full sm:w-auto"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MembersDrawer;
