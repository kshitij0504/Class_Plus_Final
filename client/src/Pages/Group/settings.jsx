import React, { useState, useEffect } from "react";
import { Collapse, Badge, Button, Tooltip, theme } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { HiOutlineClipboardCopy, HiCheck } from "react-icons/hi";
import { FaRegCopy } from "react-icons/fa";
import { useParams } from "react-router-dom";
import axios from "axios";
import MainLayout from "./MainLayout";

const Settings = () => {
  const [teamCode, setTeamCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchTeamCode = async () => {
      try {
        const response = await axios.get(`https://class-plus-final.onrender.com/api/groups/${id}`);
        setTeamCode(response.data.data.joinCode);
      } catch (error) {
        console.error("Error fetching team code:", error);
      }
    };
    fetchTeamCode();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(teamCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { token } = theme.useToken();
  const panelStyle = {
    marginBottom: 24,
    background: "#F9FAFB", // Light gray background
    borderRadius: token.borderRadiusLG,
    border: '1px solid rgba(0, 0, 0, 0.1)', // Subtle border for better definition
    padding: "20px", // Extra padding for spacing
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-800 p-8">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold mb-8 text-blue-600 tracking-wide">Settings</h2>

        <Collapse
          bordered={false}
          defaultActiveKey={["1"]}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          style={{ background: "none" }}
        >
          {/* Team Settings Panel */}
          <Collapse.Panel header="Team Settings" key="1" style={panelStyle}>
            <ul className="space-y-6">
              <li className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 transition-all duration-300">
                <div className="text-lg font-medium">Team Code</div>
                {teamCode ? (
                  <div className="flex items-center">
                    <Badge
                      color="blue"
                      className="text-xl bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg"
                    >
                      {teamCode}
                    </Badge>
                    <Tooltip title={copied ? "Copied!" : "Copy Code"}>
                      <Button
                        type="text"
                        onClick={handleCopy}
                        className="ml-4 p-3 rounded-lg bg-gray-300 hover:bg-blue-500 transition-all duration-300"
                      >
                        {copied ? (
                          <HiCheck className="text-green-600 text-2xl animate-bounce" />
                        ) : (
                          <FaRegCopy className="text-2xl text-blue-600" />
                        )}
                      </Button>
                    </Tooltip>
                  </div>
                ) : (
                  <p className="text-gray-500">No team code found for this group.</p>
                )}
              </li>
            </ul>
          </Collapse.Panel>

          {/* Group Info Panel */}
          <Collapse.Panel header="Group Info" key="2" style={panelStyle}>
            <p className="text-lg text-gray-600">Group details and info can go here.</p>
          </Collapse.Panel>

          {/* Other Settings Panel */}
          <Collapse.Panel header="Other Settings" key="3" style={panelStyle}>
            <p className="text-lg text-gray-600">Other settings can go here.</p>
          </Collapse.Panel>
        </Collapse>
      </div>
    </div>
  );
};

export default Settings;
