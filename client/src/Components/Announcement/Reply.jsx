import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";

const Reply = ({ reply, onDelete }) => {
  console.log(reply);
  return (
    <div className="pl-12 py-3 border-l-2 border-gray-200">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <img
            src={reply.user?.avatar || ""}
            alt={reply.user?.username || "User Avatar"}
            className="h-12 w-12 object-cover rounded-full"
          />
          <AvatarFallback>{reply.user?.username?.[0] || "U"}</AvatarFallback>
        </Avatar>
        {/* <Avatar className="w-8 h-8">
        <AvatarFallback>
          {reply.user?.username?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar> */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{reply.user?.username}</span>
              <span className="text-sm text-gray-500 ml-2">
                {new Date(reply.createdAt).toLocaleString()}
              </span>
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(reply.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-gray-700 mt-1">{reply.content}</p>
        </div>
      </div>
    </div>
  );
};

export default Reply;
