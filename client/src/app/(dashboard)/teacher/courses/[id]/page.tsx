"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useGetCourseQuery, useUpdateCourseMutation } from "@/state/api";
import { courseSchema } from "@/lib/schemas";
import {
  centsToDollars,
  createCourseFormData,
  uploadAllVideos,
} from "@/lib/utils";
import { openSectionModal, setSections } from "@/state";
import { ArrowLeft, Plus } from "lucide-react";
import { Form } from "@/components/ui/form";
import Header from "@/components/header";
import { CustomFormField } from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import DroppableComponent from "@/components/Droppable";
import ChapterModal from "@/app/(dashboard)/teacher/courses/chapter-modal";
import SectionModal from "@/app/(dashboard)/teacher/courses/section-modal";

const CourseEditor = () => {
  const router = useRouter();
  const param = useParams();
  const id = param.id as string;
  const { data: course, isLoading, refetch } = useGetCourseQuery(id);
  const [updateCourse] = useUpdateCourseMutation();
  // upload video function

  const dispatch = useAppDispatch();
  const { sections } = useAppSelector((state) => state.global.courseEditor);

  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseTitle: "",
      courseDescription: "",
      courseCategory: "",
      coursePrice: "0",
      courseStatus: false,
    },
  });

  // reset the form and sections when the course changes
  // this is to ensure that the form and sections are updated when the course changes
  useEffect(() => {
    if (course) {
      methods.reset({
        courseTitle: course.title,
        courseDescription: course.description,
        courseCategory: course.category,
        coursePrice: centsToDollars(course.price),
        courseStatus: course.status === "Published",
      });
      dispatch(setSections(course.sections || []));
    }
  }, [course, methods, dispatch]);

  const onSubmit = async (data: CourseFormData) => {
    try {
      const formData = createCourseFormData(data, sections);

      const updatedCourse = await updateCourse({
        courseId: id,
        formData,
      }).unwrap();

      // await uploadAllVideos(sections, updatedCourse.sections, id, uploadVideo);

      refetch();
    } catch (error) {
      console.error("Failed to update course", error);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-5 mb-5">
        <button className="flex items-center border border-customgreys-dirtyGrey rounded-lg p-2 gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </button>
      </div>

      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Header
            title="Course Setup"
            subtitle="Complete all fields and save your course"
            rightElement={
              <div className="flex items-center space-x-4">
                <CustomFormField
                  name="courseStatus"
                  label={methods.watch("courseStatus") ? "Published" : "Draft"}
                  type="switch"
                  className="flex items-center space-x-2"
                  labelClassName={`text-sm font-medium ${
                    methods.watch("courseStatus")
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                  inputClassName="data-[state=checked]:bg-green-500"
                />
                <Button
                  type="submit"
                  className="bg-primary-700 hover:bg-primary-600"
                >
                  {methods.watch("courseStatus")
                    ? "Update Published Course"
                    : "Save Draft"}
                </Button>
              </div>
            }
          />

          <div className="flex justify-between flex-col md:flex-row gap-10 mt-5 font-dm-sans">
            <div className="basis-1/2">
              <div className="space-y-4">
                <CustomFormField
                  name="courseTitle"
                  label="Course Title"
                  type="text"
                  placeholder="Write course title here"
                  className="border-none"
                  initialValue={course?.title}
                />

                <CustomFormField
                  name="courseDescription"
                  label="Course Description"
                  type="textarea"
                  placeholder="Write course description here"
                  initialValue={course?.description}
                />

                <CustomFormField
                  name="courseCategory"
                  label="Course Category"
                  type="select"
                  placeholder="Select category here"
                  options={[
                    { label: "Technology", value: "technology" },
                    { label: "Science", value: "science" },
                    { label: "Mathematics", value: "mathematics" },
                    {
                      label: "Artificial Intelligence",
                      value: "artificial-intelligence",
                    },
                    { label: "Data Science", value: "data-science" },
                    { label: "Cybersecurity", value: "cybersecurity" },
                    { label: "Web Development", value: "web-development" },
                    {
                      label: "Mobile Development",
                      value: "mobile-development",
                    },
                    { label: "Game Development", value: "game-development" },
                    {
                      label: "Software Development",
                      value: "software-development",
                    },
                  ]}
                  initialValue={course?.category}
                />

                <CustomFormField
                  name="coursePrice"
                  label="Course Price"
                  type="number"
                  placeholder="0"
                  initialValue={centsToDollars(course?.price)}
                />
              </div>
            </div>

            <div className="bg-customgreys-darkGrey mt-4 md:mt-0 p-4 rounded-lg basis-1/2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold text-secondary-foreground">
                  Sections
                </h2>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    dispatch(openSectionModal({ sectionIndex: null }))
                  }
                  className="border-none text-primary-700 group"
                >
                  <Plus className="mr-1 h-4 w-4 text-primary-700 group-hover:white-100" />
                  <span className="text-primary-700 group-hover:white-100">
                    Add Section
                  </span>
                </Button>
              </div>

              {isLoading ? (
                <p>Loading course content...</p>
              ) : sections.length > 0 ? (
                <DroppableComponent />
              ) : (
                <p>No sections available</p>
              )}
            </div>
          </div>
        </form>
      </Form>

      <ChapterModal />
      <SectionModal />
    </div>
  );
};

export default CourseEditor;
