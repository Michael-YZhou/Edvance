import express from "express";
import {
  getUserCourseProgress,
  getUserEnrolledCourses,
  updateUserCourseProgress,
} from "../controllers/userCourseProgressController";

const router = express.Router();

router.get("/:userId/enrolled-courses", getUserEnrolledCourses);
router.get("/:userId/courses/:courseId", getUserCourseProgress);
router.post("/:userId/courses/:courseId", updateUserCourseProgress);

export default router;
