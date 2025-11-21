import "./navbar.css";
import { useAuth } from "../../contexts/AuthContext";
import { IoIosSearch } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoPersonSharp } from "react-icons/io5";
import { useState } from "react";

export function Navbar({ onMenuClick }) {
  const [searchOpen, setSearchOpen] = useState(false);


  return (
    <header className="navbar">
      <div className="left-group">
        <div className="menu" onClick={onMenuClick}>
          <RxHamburgerMenu color="#0B293CCC" />
        </div>

        {!searchOpen && (
          <div className="search" onClick={() => setSearchOpen(true)}>
            <IoIosSearch color="#0B293CCC" />
          </div>
        )}

        {searchOpen && (
          <div className="search-container">
            <input
              className="searchOpen"
              type="text"
              placeholder="Search..."
            />

            <button
              className="searchClear"
              onClick={() => setSearchOpen(false)}
            >
              X
            </button>
          </div>
        )}
      </div>

      <div className="avatar">
        <IoPersonSharp color="#0B293CCC" size={30} />
      </div>
    </header>
  );
}
