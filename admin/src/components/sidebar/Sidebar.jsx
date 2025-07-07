import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBasket,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  PackageMinus,
  User,
  CheckIcon,
  ShoppingBag,
  File,
  User2,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Member",
    href: "/daftarPelanggan",
    icon: Users,
  },
  {
    title: "Pegawai tunggu",
    href: "/manajemenUser",
    icon: Users,
  },
  {
    title: "kasir",
    href: "/kasir",
    icon: ShoppingBag,
  },
  {
    title: "Bahan Mentah",
    submenu: [
      {
        title: "Bahan Keluar",
        href: "/keluar",
        allowedRoles: ["Admin", "Pegawai"],
      },
      {
        title: "Riwayat Bahan Keluar",
        href: "/daftarKeluar",
        allowedRoles: ["Admin", "Pegawai"],
      },
    ],
    icon: File,
  },
  {
    title: "Produk",
    href: "/produk",
    icon: Package,
    submenu: [
      {
        title: "Daftar Produk",
        href: "/list",
        allowedRoles: ["Admin", "Pegawai"],
      },
      {
        title: "Daftar Bahan",
        href: "/daftarBaku",
        allowedRoles: ["Admin", "Pegawai"],
      },
    ],
  },
  {
    title: "Transaksi",
    href: "/transaksi",
    icon: ShoppingBasket,
    submenu: [
      {
        title: "Pemasukan",
        href: "/daftarPemasukan",
        allowedRoles: ["Admin", "Pegawai"],
      },
      {
        title: "Pengeluaran",
        href: "/daftarPengeluaran",
        allowedRoles: ["Admin", "Pegawai"],
      },
    ],
  },
  {
    title: "Absensi",
    href: "/absens",
    icon: User,
    submenu: [
      { title: "Absensi", href: "/absen", allowedRoles: ["Admin", "Pegawai"] },
      { title: "Daftar Absen", href: "/daftarAbsen", allowedRoles: ["Admin"] },
      { title: "Rekap Absen", href: "/rekapAbsen", allowedRoles: ["Admin"] },
      {
        title: "Daftar Karyawan",
        href: "/daftarKaryawan",
        allowedRoles: ["Admin"],
      },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.kategori || "pegawai";

  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (href) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const isActiveLink = (href) => currentPath === href;
  const isSubLinkActive = (submenu = []) =>
    submenu.some((item) => currentPath === item.href);

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white w-64 shadow-lg">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-700">
        <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
          <ShoppingBasket className="h-6 w-6 text-orange-400" />
          <span>Labodine</span>
        </Link>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isParentActive =
              isSubLinkActive(item.submenu) || isActiveLink(item.href);
            return (
              <div key={item.href || item.title}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.href)}
                      className={`flex items-center w-full p-2 rounded-md transition-colors duration-200
                      ${
                        isParentActive
                          ? "bg-gray-700 text-white"
                          : "hover:bg-gray-700 text-gray-300"
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.title}</span>
                      <ChevronDown
                        className={`ml-auto h-4 w-4 transition-transform ${
                          openSubmenus[item.href] ||
                          isSubLinkActive(item.submenu)
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                    {(openSubmenus[item.href] ||
                      isSubLinkActive(item.submenu)) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu
                          .filter((subItem) =>
                            subItem.allowedRoles?.includes(userRole)
                          )
                          .map((subItem) => (
                            <Link
                              key={subItem.href || subItem.title}
                              to={subItem.href}
                              className={`flex items-center p-2 rounded-md text-sm transition-colors duration-200
                              ${
                                isActiveLink(subItem.href)
                                  ? "bg-gray-600 text-white"
                                  : "hover:bg-gray-600 text-gray-400"
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center p-2 rounded-md transition-colors duration-200
                    ${
                      isActiveLink(item.href)
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.title}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
