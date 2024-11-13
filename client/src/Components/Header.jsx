import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { useSelector } from "react-redux";
import image from "../assets/logo1.png";
import { CgProfile } from "react-icons/cg";
import { CiLogout } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { signoutStart, signoutSuccess } from "../redux/user/userSlice";
export default function Header() {
  const { currentUser } = useSelector((state) => state.user || {});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      dispatch(signoutStart());

      await axios.get("/api/signout", { withCredentials: true });
      dispatch(signoutSuccess());
      navigate("/signin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  return (
    <Navbar
      fluid
      rounded
      className="bg-gray-900 px-4 py-2 shadow-md md:px-8 lg:px-16 mt-5"
    >
      <Navbar.Brand href="/">
        <img
          src={image}
          alt="Logo Here"
          className="h-8 w-8 md:h-12 md:w-12 mr-2"
        />
        <span className="text-xl md:text-2xl font-semibold text-white">
          Class Plus
        </span>
      </Navbar.Brand>
      <div className="flex items-center gap-4 ml-auto">
       
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar
              alt="User settings"
              img={
                currentUser.avatar ||
                "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
              }
              rounded
            />
          }
        >
          <Dropdown.Header>
            <span className="block text-sm font-medium text-gray-900">
              {currentUser.username || "User"}
            </span>
            <span className="block truncate text-sm font-medium text-gray-600">
              {currentUser.email || "user@example.com"}
            </span>
          </Dropdown.Header>
          <Dropdown.Item>
            <Link to="/updateprofile">
              <span className="flex items-center gap-2 text-sm text-gray-800 hover:text-blue-600">
                <CgProfile />
                Profile
              </span>
            </Link>
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item>
            <span
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-800 hover:text-red-600"
            >
              <CiLogout />
              Sign out
            </span>
          </Dropdown.Item>
        </Dropdown>
      </div>
    </Navbar>
  );
}
