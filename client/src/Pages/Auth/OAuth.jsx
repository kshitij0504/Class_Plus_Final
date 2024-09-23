import React from "react";
import { Button } from "flowbite-react";
import download from "../../assets/download.png";
import { app } from "../../firebase";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { signinFailure, signinSuccess } from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios"; // Import Axios

const OAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAuth(app);

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      console.log(resultsFromGoogle);

      // Use Axios to make the POST request
      const response = await axios.post("http://localhost:8000/api/google-auth", {
        username: resultsFromGoogle.user.displayName,
        email: resultsFromGoogle.user.email,
        googlePhotoURL: resultsFromGoogle.user.photoURL,
      }, {
        withCredentials: true, // Ensure cookies are sent with the request
      });

      console.log(response);

      if (response.status === 200) {
        dispatch(signinSuccess(response.data.data.user));
        navigate("/home");
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      dispatch(signinFailure());
    }
  };

  return (
    <Button
      color="failure"
      pill
      className="mt-6 w-full flex items-center justify-center gap-2"
      type="button"
      onClick={handleGoogleClick}
    >
      <img src={download} className="h-6 w-6 rounded-full mr-2" alt="Download" />
      Sign Up with Google
    </Button>
  );
};

export default OAuth;
