// src/components/MeetingList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Table, Button } from "flowbite-react";

const MeetingList = () => {
  const { id } = useParams(); // Group ID
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/meetings/group/${id}`,
          {
            withCredentials: true,
          }
        );

        setMeetings(response.data.data);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-800 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-white mb-4">
        Scheduled Meetings
      </h2>
      <Table>
        <Table.Head>
          <Table.HeadCell>Title</Table.HeadCell>
          <Table.HeadCell>Description</Table.HeadCell>
          <Table.HeadCell>Scheduled At</Table.HeadCell>
          <Table.HeadCell>Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {meetings.map((meeting) => (
            <Table.Row key={meeting.id} className="bg-gray-700">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {meeting.title}
              </Table.Cell>
              <Table.Cell>{meeting.description || "N/A"}</Table.Cell>
              <Table.Cell>
                {new Date(meeting.scheduledAt).toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                <Button href={`/meetings/${meeting.meetingID}`} target="_blank">
                  Join
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default MeetingList;
