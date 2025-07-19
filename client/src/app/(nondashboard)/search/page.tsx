"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useGetCoursesQuery } from "@/state/api";
import Loading from "@/components/loading";
import CourseCardSearch from "@/components/course-card-search";
import SelectedCourse from "./SelectedCourse";

function Search() {
  const searchParams = useSearchParams();
  // get the course id from the url
  const id = searchParams.get("id");
  const { data: courses, isLoading, isError } = useGetCoursesQuery({});
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const router = useRouter();

  console.log(courses);
  useEffect(() => {
    if (courses) {
      // if the course id is in the url, set the selected course to the course with the id
      if (id) {
        const course = courses.find((course) => course.courseId === id);
        setSelectedCourse(course || courses[0]);
      } else {
        // if the course id is not in the url, set the selected course to the first course
        setSelectedCourse(courses[0]);
      }
    }
  }, [courses, id]);

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Failed to fetch courses</div>;

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    router.push(`/search?id=${course.courseId}`);
  };

  const handleEnrollNow = () => {
    if (selectedCourse) {
      router.push(
        `/checkout?step=1&id=${selectedCourse.courseId}&showSignUp=false`
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      // className="search"
    >
      <h1 className="search__title">List of available courses</h1>
      <h2 className="search__subtitle">{courses.length} courses available</h2>
      <div className="search__content">
        <motion.div
          initial={{ y: 40, opacity: 0 }} // initial position of the course card
          animate={{ y: 0, opacity: 1 }} // final position of the course card
          transition={{ duration: 0.5, delay: 0.2 }} // every course card will have a delay of 0.2 seconds
          className="search__courses-grid"
        >
          {courses.map((course) => (
            <CourseCardSearch
              key={course.courseId}
              course={course}
              isSelected={selectedCourse?.courseId === course.courseId}
              onClick={() => handleCourseSelect(course)}
            />
          ))}
        </motion.div>

        {selectedCourse && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="search__selected-course"
          >
            <SelectedCourse
              course={selectedCourse}
              handleEnrollNow={handleEnrollNow}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default Search;
