import { Request, Response } from "express";
import Course from "../models/courseModel";

/* List all courses */
export const listCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category } = req.query;
  try {
    const courses =
      category && category !== "all"
        ? // if category is not all, scan the category column and filter by the category then return the courses
          await Course.scan("category").eq(category).exec()
        : // if category is not provided, scan the entire table and return all courses
          await Course.scan().exec();
    res
      .status(200)
      .json({ message: "courses retrieved successfully", data: courses });
  } catch (error) {
    res.status(500).json({ message: "Error retriving courses", error: error });
  }
};

/* Get a single course */
export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "course retrieved successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving course", error: error });
  }
};
