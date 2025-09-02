import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;