import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://class-plus-final.onrender.com/api/forgot-password",
        { email }
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-100">
            Forgot your password?
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter your email address below and we'll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 
                  bg-gray-700 text-gray-100 placeholder-gray-400 
                  focus:ring-gray-500 focus:border-gray-500 focus:outline-none focus:ring-2 
                  transition duration-150 ease-in-out sm:text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent 
              rounded-md shadow-sm text-sm font-medium text-white
              bg-gray-600 hover:bg-gray-500 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 
              focus:ring-offset-gray-900
              transition-colors duration-200 ease-in-out 
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <ArrowRight className="h-5 w-5 mr-2" />
              )}
              {isLoading ? "Sending Link..." : "Reset Password"}
            </button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <a
            href="/signin"
            className="text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors duration-200"
          >
            Back to login
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
