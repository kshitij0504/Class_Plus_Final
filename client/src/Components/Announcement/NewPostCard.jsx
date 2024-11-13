import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const NewPostCard = ({ avatar, setIsDialogOpen }) => (
  <Card className="p-4 mb-6 hover:shadow-lg transition-shadow bg-gray-100 border border-gray-300 rounded-lg font-poppins">
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
      <Avatar>
        <img
          className="w-12 h-12 md:w-16 md:h-16 bg-blue-200 text-blue-600"
          src={avatar}
          alt="User Avatar"
        />
      </Avatar>
      <Button
        variant="outline"
        className="w-full md:w-auto text-left md:justify-start h-auto py-4 px-4 bg-gray-200 rounded-md text-gray-600 hover:bg-gray-300"
        onClick={() => setIsDialogOpen(true)}
      >
        Start a new post...
      </Button>
    </div>
  </Card>
);

export default NewPostCard;