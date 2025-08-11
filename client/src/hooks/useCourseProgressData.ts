import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetCourseQuery,
  useGetUserCourseProgressQuery,
  useUpdateUserCourseProgressMutation,
} from "@/state/api";
import { useUser } from "@clerk/nextjs";

export const useCourseProgressData = () => {
  const { courseId, chapterId } = useParams();
  const { user, isLoaded } = useUser();
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const [updateProgress] = useUpdateUserCourseProgressMutation();

  // Get the course data
  const { data: course, isLoading: courseLoading } = useGetCourseQuery(
    (courseId as string) ?? "",
    {
      skip: !courseId,
    }
  );

  // Get the user's course progress
  const { data: userProgress, isLoading: progressLoading } =
    useGetUserCourseProgressQuery(
      {
        userId: user?.id ?? "",
        courseId: (courseId as string) ?? "",
      },
      {
        skip: !isLoaded || !user || !courseId,
      }
    );

  // check if the course is loading (user is loaded, course is loading, progress is loading)
  const isLoading = !isLoaded || courseLoading || progressLoading;

  // Get the current section and chapter from the course data
  const currentSection = course?.sections.find((s) =>
    s.chapters.some((c) => c.chapterId === chapterId)
  );

  const currentChapter = currentSection?.chapters.find(
    (c) => c.chapterId === chapterId
  );

  // Check if the current chapter is completed
  const isChapterCompleted = () => {
    if (!currentSection || !currentChapter || !userProgress?.sections)
      return false;

    const section = userProgress.sections.find(
      (s) => s.sectionId === currentSection.sectionId
    );
    return (
      section?.chapters.some(
        (c) => c.chapterId === currentChapter.chapterId && c.completed
      ) ?? false
    );
  };

  // update the chapter progress when the user completes it
  const updateChapterProgress = (
    sectionId: string,
    chapterId: string,
    completed: boolean
  ) => {
    if (!user) return;

    const updatedSections = [
      {
        sectionId,
        chapters: [
          {
            chapterId,
            completed,
          },
        ],
      },
    ];

    updateProgress({
      userId: user.id,
      courseId: (courseId as string) ?? "",
      progressData: {
        sections: updatedSections,
      },
    });
  };

  return {
    user,
    courseId,
    chapterId,
    course,
    userProgress,
    currentSection,
    currentChapter,
    isLoading,
    isChapterCompleted,
    updateChapterProgress,
    hasMarkedComplete,
    setHasMarkedComplete,
  };
};
