import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, LogOut, Shield } from "lucide-react";
import { useState } from "react";

const LOGO = "/shreemothergold_logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isApproved = user?.approved || user?.role === "admin";

  const handleLogout = () => { logout(); navigate("/"); setOpen(false); };

  const navLinks = [
    { to: "/", label: "Home", show: true },
    { to: "/about", label: "About", show: true },
    { to: "/catalogue", label: "Catalogue", show: isApproved },
    { to: "/customisation", label: "Customisation", show: isApproved },
    { to: "/contact", label: "Contact", show: true },
  ];

  return (
    <nav data-testid="navbar" className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="w-full px-4 md:px-8 h-20 flex items-center">
      <Link
  to="/"
  className="flex items-center gap-1 sm:gap-2 shrink-0"
  data-testid="nav-logo"
>
  <img
    src={LOGO}
    alt="Shree Mother Gold & Diamond Jewellery"
    className="h-5 w-5 sm:h-16 sm:w-16 object-contain flex-shrink-0"
  />

  <span
    className="
      font-heading
      text-[11px]
      sm:text-xl
      font-semibold
      text-[#0A0A0A]
      whitespace-nowrap
      leading-none
    "
  >
    Shree Mother Gold & Diamond Jewellery
  </span>
</Link>

        <div className="hidden lg:flex items-center gap-8 mx-auto">
          {navLinks.filter(l => l.show).map(l => (
            <Link key={l.to} to={l.to} data-testid={`nav-${l.label.toLowerCase()}-link`}
              className="text-[#4B5563] hover:text-[#359E58] transition-colors text-sm font-medium tracking-wide">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3 ml-auto">
          {user ? (
            <>
              {isApproved && (
                <Link to="/cart" data-testid="nav-cart-link">
                  <Button variant="ghost" size="icon"><ShoppingCart className="w-5 h-5" strokeWidth={1.5} /></Button>
                </Link>
              )}
              {user.role === "admin" && (
                <Link to="/admin" data-testid="nav-admin-link">
                  <Button variant="ghost" size="sm" className="gap-2 text-[#359E58]">
                    <Shield className="w-4 h-4" strokeWidth={1.5} />Admin
                  </Button>
                </Link>
              )}
              <span className="text-sm text-[#4B5563] font-medium">{user.name}</span>
              <Button onClick={handleLogout} variant="ghost" size="icon" data-testid="nav-logout-button">
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" className="text-[#4B5563]" data-testid="nav-login-button">Login</Button></Link>
              <Link to="/register">
                <Button className="bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm px-6" data-testid="nav-register-button">
                  Apply as Retailer
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
  onClick={() => setOpen(!open)}
  className="lg:hidden ml-auto p-2"
  data-testid="nav-mobile-toggle"
>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t px-4 py-3 space-y-1 animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
          {navLinks.filter(l => l.show).map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="block py-3 px-2 text-[#4B5563] hover:text-[#359E58] hover:bg-[#FAFAFA] text-sm font-medium rounded-sm">{l.label}</Link>
          ))}
          {user ? (
            <>
              {isApproved && <Link to="/cart" onClick={() => setOpen(false)} className="block py-3 px-2 text-[#4B5563] hover:bg-[#FAFAFA] text-sm font-medium rounded-sm">Cart</Link>}
              {user.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)} className="block py-3 px-2 text-[#359E58] hover:bg-[#FAFAFA] text-sm font-medium rounded-sm">Admin Panel</Link>}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button onClick={handleLogout} className="block w-full text-left py-3 px-2 text-red-500 text-sm font-medium rounded-sm">Logout ({user.name})</button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 mt-2">
              <Link to="/login" onClick={() => setOpen(false)}><Button variant="outline" className="w-full rounded-sm">Login</Button></Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                <Button className="w-full bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm">Apply as Retailer</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
} 