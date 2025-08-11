import { Request, Response } from "express";
import Course from "../models/courseModel";
import aws from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/express";

// create a new S3 instance
const s3 = new aws.S3();

/**
 * List all courses
 * @param req - The request object
 * @param res - The response object
 * @returns A list of courses
 */
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
    res.json({ message: "courses retrieved successfully", data: courses });
  } catch (error) {
    res.status(500).json({ message: "Error retriving courses", error: error });
  }
};

/**
 * Get a single course
 * @param req - The request object
 * @param res - The response object
 * @returns A single course
 */
export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res.json({ message: "course retrieved successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving course", error: error });
  }
};

export const createCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teacherId, teacherName } = req.body;

    // make sure teacherId and teacherName are provided
    if (!teacherId || !teacherName) {
      res.status(400).json({ message: "Teacher ID and name are required" });
      return;
    }

    // create an instance of a new course with default values
    const newCourse = new Course({
      courseId: uuidv4(),
      teacherId,
      teacherName,
      title: "Untitled Course",
      description: "No description provided",
      category: "Uncategorized",
      image: "",
      price: 0,
      level: "Beginner",
      status: "Draft",
      sections: [],
      enrollments: [],
    });
    // save the new course to the database
    await newCourse.save();
    res.json({ message: "course created successfully", data: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error: error });
  }
};

/**
 * Update a course
 * @param req - The request object
 * @param res - The response object
 * @returns A message indicating the course was updated successfully
 */
export const updateCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const updateData = { ...req.body };
  const { userId } = getAuth(req); // The getAuth() helper retrieves authentication state from the request object.

  try {
    const course = await Course.get(courseId); // get the current course info from the database

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (course.teacherId !== userId) {
      res.status(403).json({ message: "Not authorized to update this course" });
      return;
    }

    if (updateData.price) {
      const price = parseInt(updateData.price);
      if (isNaN(price) || price < 0) {
        res.status(400).json({
          message: "Invalid price format",
          error: "Price must be a valid number",
        });
        return;
      }
      updateData.price = price * 100;
    }
    // update the sections data
    if (updateData.sections) {
      const sectionsData =
        typeof updateData.sections === "string"
          ? JSON.parse(updateData.sections)
          : updateData.sections;
      // cicle through each section and create a new sectionId and chapterId for each chapter
      updateData.sections = sectionsData.map((section: any) => ({
        ...section,
        sectionId: section.sectionId || uuidv4(), // if sectionId is not provided, create a new one
        chapters: section.chapters.map((chapter: any) => ({
          ...chapter,
          chapterId: chapter.chapterId || uuidv4(), // if chapterId is not provided, create a new one
        })),
      }));
    }

    // update the course with the new data by using the Object.assign() method
    // it will overwrite the existing fields with the new data
    // and add any extra fields to the course
    Object.assign(course, updateData);
    // save the updated course to the database
    await course.save();

    res.json({ message: "Course updated successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error: error });
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const userId = getAuth(req); // The getAuth() helper retrieves authentication state from the request object.

  try {
    // get the current course info from the database and apply save checks
    const course = await Course.get(courseId);

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (course.teacherId !== userId) {
      res.status(403).json({ message: "Not authorized to delete this course" });
      return;
    }

    // delete the course from the database
    await course.delete();

    res.json({ message: "course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error: error });
  }
};

/**
 * Get a pre-signed URL to upload a video to S3 and a video URL to update the course's video URL
 * @param req - The request object
 * @param res - The response object
 * @returns A pre-signed URL to upload a video to S3 and a video URL to update the course's video URL
 */
export const getUploadVideoUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    res.status(400).json({ message: "File name and file type are required" });
    return;
  }

  try {
    const uniqueId = uuidv4();
    // The S3 key is the path to the video in the S3 bucket.
    const s3Key = `videos/${uniqueId}/${fileName}`;

    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME || "",
      Key: s3Key,
      Expires: 60,
      ContentType: fileType,
    };

    // Generate a pre-signed URL to upload the video to S3. This URL allows a client to upload a file directly to S3
    // without needing to authenticate with AWS. The URL expires after 60 seconds.
    // The user then uploads the file to S3.
    const uploadUrl = s3.getSignedUrl("putObject", s3Params);
    // CloudFront is a CDN that serves the video from the S3 bucket.
    // The Domain is saved in the .env file once the CloudFront distribution is created.
    // The video URL is the URL of the video on the CDN.
    // This URL is used to update the course's video URL.
    const videoUrl = `${process.env.CLOUDFRONT_DOMAIN}/videos/${uniqueId}/${fileName}`;

    // the uploadUrl is the URL to upload the video to S3.
    // the videoUrl is the URL of the video on the CDN.
    res.json({
      message: "Upload URL generated successfully",
      data: {
        uploadUrl,
        videoUrl,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating upload URL", error: error });
  }
};
