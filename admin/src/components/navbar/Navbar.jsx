import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Ambil data user dari localStorage
  const user = JSON.parse(localStorage.getItem("user")); // <--- ini kuncinya
  const name = user?.name || user?.username || "Admin";
  const email = user?.email || "-";
  const kategori = user?.kategori || "-";

  console.log(JSON.parse(localStorage.getItem("user")));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-800 text-white shadow-md border-b border-gray-700">
      <div className="flex flex-col gap-1">
        {token && (
          <>
            <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
              Selamat datang, <span className="text-white font-medium">{name}</span><br />
              <span className="text-xs text-gray-400">{email}</span><br />
              <span className="text-xs text-gray-400 italic">{kategori}</span>
            </div>
            <button
              onClick={handleLogout}
              className="mt-1 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
      <img
        src={assets.labodine}
        alt="Profile"
        className="h-20 w-25 rounded-full object-cover border-2 border-orange-400"
      />
    </div>
  );
};

export default Navbar;

