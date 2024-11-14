import React, { useState } from "react";
import { Button, TextInput, Textarea, Label, Alert } from "flowbite-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const Group = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "https://class-plus-final.onrender.com/api/creategroup",
        {
          name,
          description,
        },
        { withCredentials: true }
      );

      toast.success("Group created successfully!");
      // Clear the form fields
      setName("");
      setDescription("");
    } catch (err) {
      toast.error("Failed to create group. Please try again.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-lg mx-auto p-3 w-full">
        <h1 className="my-7 text-center font-semibold text-3xl">
          Create Group
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <Alert color="failure">{error}</Alert>}
          <div>
            <Label htmlFor="name">Group Name</Label>
            <TextInput
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              rows={4}
            />
          </div>
          <Button type="submit" pill disabled={loading}>
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Group;
