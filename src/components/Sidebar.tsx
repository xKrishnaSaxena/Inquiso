import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Sidebar: React.FC = () => {
  return (
    <aside className="h-screen w-64 ">
      <div className=" text-xl font-bold">
        <img className="" src="/logo-light.png" alt="" />
      </div>
      <nav className="mt-6">
        <ul>
          <li className="mb-4">
            <Link
              to="/dashboard"
              className={cn(
                "block px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              )}
            >
              Dashboard
            </Link>
          </li>
          <li className="mb-4">
            <Link
              to="/posts"
              className={cn(
                "block px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              )}
            >
              Post List
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
