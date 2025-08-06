import { Request, Response } from "express";
import UserCourseProgress from "../models/userCourseProgressModel";
import Course from "../models/courseModel";
import { getAuth } from "@clerk/express";

export const getUserEnrolledCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  // const auth = getAuth(req);

  // if (!auth || auth.userId !== userId) {
  //   res.status(403).json({
  //     message: "Unauthorized",
  //   });
  //   return;
  // }

  try {
    const enrolledCourses = await UserCourseProgress.query("userId")
      .eq(userId)
      .exec();
    const courseIds = enrolledCourses.map((item: any) => item.courseId);
    const courses = await Course.batchGet(courseIds);
    res.json({
      message: "Enrolled courses retrieved successfully",
      data: courseIds,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving enrolled courses",
      error,
    });
  }
};

export const getUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;
  // const auth = getAuth(req);

  // if (!auth || auth.userId !== userId) {
  //   res.status(403).json({
  //     message: "Unauthorized",
  //   });
  //   return;
  // }

  try {
    const progress = await UserCourseProgress.get({ userId, courseId });
    res.json({
      message: "Course progress retrieved successfully",
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving course progress",
      error,
    });
  }
};
