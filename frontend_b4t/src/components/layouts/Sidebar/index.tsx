// import React, { FC } from "react";
// import { IoSettingsOutline } from "react-icons/io5";
// import { FaChartBar } from "react-icons/fa";
// import { Button } from "@/components/ui/button";
// import { RxAvatar } from "react-icons/rx";

// const Sidebar: FC = () => {
//   return (
//     <div className="w-64 min-h-screen border-r flex flex-col">
//     <div className="px-3 py-4">
//       <h2 className="mb-6 px-4 text-lg font-semibold">B4T</h2>

//       <Button
//         variant="ghost"
//         className="w-full justify-start rounded-none"
//       >
//         <FaChartBar className="mr-2 text-lg" />
//         Dashboard
//       </Button>
//     </div>
//     <div className="mt-auto px-3 py-4">
//       <h2 className="mb-2 px-4 text-lg font-semibold">Settings</h2>

//       <div className="space-y-3">
//         <Button
//           variant="ghost"
//           className="w-full justify-start rounded-none"
//         >
//           <IoSettingsOutline className="mr-2 text-lg" />
//           Setting
//         </Button>
//         <Button
//           variant="ghost"
//           className="w-full justify-start rounded-none">
//           <RxAvatar className="mr-2 text-lg" />
//           Profile
//         </Button>
//       </div>
//   </div>
//     </div>
//   );
// };

// export default Sidebar;

"use client";

import React, { FC, useEffect, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { FaChartBar } from "react-icons/fa";
import { RxAvatar } from "react-icons/rx";
import { Button } from "@/components/ui/button";
import { getProfile, type User } from "@/lib/user";
import { useRouter } from "next/navigation";

const Sidebar: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    getProfile()
      .then(setUser)
      .catch(() => {
        // token invalid / expired
        localStorage.removeItem("token");
        router.push("/auth/Signin");
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/Signin");
  };

  return (
    <div className="w-64 min-h-screen border-r flex flex-col">
      <div className="px-3 py-4">
        <h2 className="mb-6 px-4 text-lg font-semibold">B4T</h2>

        <Button variant="ghost" className="w-full justify-start rounded-none">
          <FaChartBar className="mr-2 text-lg" />
          Dashboard
        </Button>
      </div>
      
      <div className="mt-auto px-3 py-4 border-t">
        <h2 className="mb-3 px-4 text-sm font-semibold text-muted-foreground">
          Settings
        </h2>

        <Button variant="ghost" className="w-full justify-start rounded-none">
          <IoSettingsOutline className="mr-2 text-lg" />
          Setting
        </Button>

        {/* PROFILE */}
        {user && (
          <div className="mt-4 px-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <RxAvatar className="text-xl text-primary" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className="mt-4 w-full justify-start rounded-none text-red-600"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
