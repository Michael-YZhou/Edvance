import { useGetCourseQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";

/**
 * Custom hook to get the current course
 * @returns {Object} - An object containing the course, course id, and the rest of the course data
 */
export const useCurrentCourse = () => {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id") ?? "";
  const { data: course, ...rest } = useGetCourseQuery(courseId);

  return { course, courseId, ...rest };
};
