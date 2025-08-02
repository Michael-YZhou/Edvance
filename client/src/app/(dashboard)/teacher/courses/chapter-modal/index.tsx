import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ChapterFormData, chapterSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { addChapter, closeChapterModal, editChapter } from "@/state";
import CustomModal from "@/components/custom-modal";
import { X } from "lucide-react";
import { Form } from "@/components/ui/form";

const ChapterModal = () => {
  const dispatch = useAppDispatch();
  const {
    isChapterModalOpen,
    selectedChapterIndex,
    selectedSectionIndex,
    sections,
  } = useAppSelector((state) => state.global.courseEditor);

  const chapter: Chapter | undefined =
    selectedSectionIndex !== null && selectedChapterIndex !== null
      ? sections[selectedSectionIndex].chapters[selectedChapterIndex]
      : undefined;

  const methods = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: "",
      content: "",
      video: "",
    },
  });

  // if chapter exists, reset the form with the chapter data
  // if chapter does not exist, reset the form with the default values
  useEffect(() => {
    if (chapter) {
      methods.reset({
        title: chapter.title,
        content: chapter.content,
        video: chapter.video || "",
      });
    } else {
      methods.reset({
        title: "",
        content: "",
        video: "",
      });
    }
  }, [chapter, methods]);

  const onClose = () => {
    dispatch(closeChapterModal());
  };

  const onSubmit = (data: ChapterFormData) => {
    // if section does not exist, return
    // because we can't add a chapter to a non-existent section
    if (selectedSectionIndex === null) return;

    // create new chapter object with the form data
    const newChapter: Chapter = {
      chapterId: chapter?.chapterId || uuidv4(),
      title: data.title,
      content: data.content,
      type: data.video ? "Video" : "Text",
      video: data.video,
    };

    // if chapter does not exist, add it
    // if chapter exists, edit it
    if (selectedChapterIndex === null) {
      dispatch(
        addChapter({ sectionIndex: selectedSectionIndex, chapter: newChapter })
      );
    } else {
      dispatch(
        editChapter({
          sectionIndex: selectedSectionIndex,
          chapterIndex: selectedChapterIndex,
          chapter: newChapter,
        })
      );
    }

    toast.success("Chapter added successfully");
    onClose();
  };

  return (
    <CustomModal isOpen={isChapterModalOpen} onClose={onClose}>
      <div className="chapter-modal">
        <div className="chapter-modal__header">
          <h2 className="chapter-modal__title">Add/Edit Chapter</h2>
          <button onClick={onClose} className="chapter-modal__close">
            <X className="w-6 h-6" />
          </button>
        </div>

        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}></form>
        </Form>
      </div>
    </CustomModal>
  );
};

export default ChapterModal;
