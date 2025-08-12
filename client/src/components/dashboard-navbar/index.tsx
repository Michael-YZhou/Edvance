"use client";

import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Bell } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { SidebarTrigger } from "../ui/sidebar";
import { cn } from "@/lib/utils";

export default function DashboardNavbar({
  isCoursePage,
}: {
  isCoursePage: boolean;
}) {
  // this is the user object from Clerk that we use to get the user's info
  const { user } = useUser();
  // grab the user's role from the public usermetadata
  const userRole = user?.publicMetadata?.userType as "student" | "teacher";

  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-navbar__container">
        <div className="dashboard-navbar__search">
          <div className="md:hidden">
            <SidebarTrigger className="dashboard-navbar__sidebar-trigger" />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Link
                href="/search"
                scroll={false}
                className={cn("dashboard-navbar__search-input", {
                  "bg-customgreys-secondarybg": isCoursePage,
                })}
              >
                <span className="hidden sm:inline">Search Courses</span>
                <span className="sm:hidden">Search</span>
              </Link>
              <BookOpen className="dashboard-navbar__search-icon" size={18} />
            </div>
          </div>
        </div>

        <div className="dashboard-navbar__actions">
          <button className="nondashboard-navbar__notification-button">
            <span className="nondashboard-navbar__notification-indicator"></span>
            <Bell
              className="nondashboard-navbar__notification-icon"
              size={18}
            />
          </button>

          <UserButton
            appearance={{
              baseTheme: dark,
              elements: {
                userButtonOuterIdentifier: "text-customgreys-dirtyGrey",
                userButtonBox: "scale-90 sm:scale-100",
                userButtonPopoverFooter: {
                  "& > div:nth-child(1) > div:nth-child(1)": {
                    background: "none",
                  },
                },
              },
            }}
            showName={true}
            userProfileMode="navigation"
            userProfileUrl={
              userRole === "teacher" ? "/teacher/profile" : "/user/profile"
            }
          />
        </div>
      </div>
    </nav>
  );
}
