import React, { useState } from "react";
import { Button } from "flowbite-react";
import download from "../../assets/download.png";
import { app } from "../../firebase";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { signinFailure, signinSuccess, signinStart } from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";

const OAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAuth(app);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      setIsLoading(true);
      dispatch(signinStart());

      // Handle Google Sign In
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      
      // Get the ID token
      const idToken = await resultsFromGoogle.user.getIdToken();
      
      // Make server request with the token
      const response = await axios.post(
        "https://class-plus-final.onrender.com/api/google-auth",
        {
          username: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoURL: resultsFromGoogle.user.photoURL,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      console.log(response.data.data.token)
      if (response.status === 200 && response.data.data.user) {
        // Store both user and token in Redux
        dispatch(signinSuccess({
          user: response.data.data.user,
          token: response.data.data.token  // Make sure your server returns a token
        }));

        // Store token in localStorage if needed
        localStorage.setItem('authToken', response.data.token);
        
        // Wait for state to update before navigating
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate and reset loading state
        setIsLoading(false);
        navigate("/home");
      } else {
        throw new Error("Invalid server response");
      }

    } catch (error) {
      console.error("Authentication error:", error);
      setIsLoading(false);
      dispatch(signinFailure(error.message || "Authentication failed"));
      alert("Sign in failed. Please try again.");
    }
  };

  return (
    <Button
      color="failure"
      pill
      className="mt-6 w-full flex items-center justify-center gap-2"
      type="button"
      onClick={handleGoogleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          <span>Signing in...</span>
        </div>
      ) : (
        <>
          <img src={download} className="h-6 w-6 rounded-full mr-2" alt="Download" />
          Sign Up with Google
        </>
      )}
    </Button>
  );
};

export default OAuth;