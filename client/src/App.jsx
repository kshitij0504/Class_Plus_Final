import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./Pages/Auth/SignIn";
import SignUp from "./Pages/Auth/SignUp";
import toast, { Toaster } from "react-hot-toast";
import Otp from "./Pages/Auth/Otp";
import Home from "./Pages/Home";
import PrivatePage from "./Components/PrivatePage";
import UpdateProfile from "./Pages/UpdateProfile";
import DisplayGroup from "./Pages/Group/DisplayGroup";
import LayoutwithSidebar from "./Components/LayoutwithSidebar";
import ParticularGroup from "./Pages/Group/ParticualarGroup";
import NotificationSection from "./Pages/UserPage/NotificationSection";
import Settings from "./Pages/Group/settings";
import MainLoader from "./Components/Loader/MainLoader";
import ScheduleForm from "./Pages/Group/ScheduleForm";
import SessionCalendar from "./Pages/UserPage/SessionCalendar";
import Chat from "./Pages/Group/Chat";

import JoinMeeting from "./Components/Meeting/JoinMeeting";
import MeetingScheduler from "./Components/Meeting/MeetingScheduler";
import MeetingRoom from "./Components/Meeting/MeetingRoom";
import WebRTCMeetingRoom from "./Components/Meeting/MeetingRoom";
import LandingPage from "./Pages/LandingPage";
import ContactPage from "./Pages/ContactUs";
import AboutPage from "./Pages/AboutUs";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading ? (
        <MainLoader /> // Show loader while isLoading is true
      ) : (
        <BrowserRouter>
          <Toaster />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/otp" element={<Otp />} />
            <Route element={<PrivatePage />}>
              <Route element={<LayoutwithSidebar />}>
                <Route path="/home" element={<Home />} />
                <Route path="/updateprofile" element={<UpdateProfile />} />
                <Route path="/displaygroups" element={<DisplayGroup />} />
                <Route path="/groups/:id" element={<ParticularGroup />} />
                <Route path="/groups/:id/chat" element={<Chat />} />
                <Route path="/notification" element={<NotificationSection />} />
                <Route path="/settings/:id" element={<Settings />} />
                <Route
                  path="/createsession/:groupId"
                  element={<ScheduleForm />}
                />
                <Route path="/session" element={<SessionCalendar />} />
                <Route
                  path="/groups/:id/video"
                  element={<MeetingScheduler />}
                />
                {/* New Routes */}
                <Route
                  path="/meetings/:meetingID"
                  render={({ match }) => (
                    <MeetingRoom
                      meetingID={match.params.meetingID}
                      userId={currentUser.id}
                      username={currentUser.name}
                    />
                  )}
                />
                <Route
                  path="/meeting-room/:meetingId"
                  element={<WebRTCMeetingRoom />}
                />
                <Route path="/join/:meetingId" element={<JoinMeeting />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
