import { useGetCourseQuery } from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const CourseEditor = () => {
  const router = useRouter();
  const param = useParams();
  const id = param.id as string;
  const { data: course, isLoading, refetch } = useGetCourseQuery(id);
  const [updateCourse] = useUpdateCourseMutation();
  // upload video function

  const dispatch = useAppDispatch();
  const { sections } = useAppSelector((state) => state.global.courseEditor);

  return <div>CourseEditor</div>;
};

export default CourseEditor;
