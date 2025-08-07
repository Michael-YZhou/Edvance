"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/app-sidebar";
import DashboardNavbar from "@/components/dashboard-navbar";
import Loading from "@/components/loading";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import ChaptersSidebar from "./user/courses/[courseId]/ChaptersSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [courseId, setCourseId] = useState<string | null>(null);
  const { user, isLoaded } = useUser();
  const isCoursePage = /^\/user\/courses\/[^\/]+(?:\/chapters\/[^\/]+)?$/.test(
    pathname
  );

  useEffect(() => {
    if (isCoursePage) {
      const match = pathname.match(/\/user\/courses\/([^\/]+)/);
      setCourseId(match ? match[1] : null);
    }
  }, [pathname, isCoursePage]);

  if (!isLoaded) return <Loading />;
  if (!user) return <div>Please sign in to Access this page.</div>;

  return (
    <SidebarProvider>
      <div className="dashboard">
        <AppSidebar />
        <div className="dashboard__content">
          {courseId && <ChaptersSidebar />}
          <div className={cn("dashboard__main")} style={{ height: "100vh" }}>
            <DashboardNavbar isCoursePage={isCoursePage} />
            <main className="dashboard__body">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
