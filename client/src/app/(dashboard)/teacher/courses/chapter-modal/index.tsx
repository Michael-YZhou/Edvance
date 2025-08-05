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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CustomFormField } from "@/components/CustomFormField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

    toast.success(
      "Chapter added successfully but you need to save the course to apply the changes"
    );
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
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <CustomFormField
              name="title"
              label="Chapter Title"
              placeholder="Write chapter title here"
            />

            <CustomFormField
              name="content"
              label="Chapter Content"
              placeholder="Write chapter content here"
              type="textarea"
            />

            <FormField
              control={methods.control}
              name="video"
              render={({ field: { onChange, value } }) => (
                <FormItem>
                  <FormLabel className="text-customgreys-dirtyGrey text-sm">
                    Chapter Video
                  </FormLabel>
                  <FormControl>
                    <>
                      {typeof value === "string" && value && (
                        <div className="mb-2 text-sm text-customgreys-dirtyGrey">
                          Current Video: {value.split("/").pop()}
                        </div>
                      )}
                      {value instanceof File && (
                        <div className="mb-2 text-sm text-customgreys-dirtyGrey">
                          Selected file: {value.name}
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        className="border-none bg-customgreys-darkGrey p-4"
                      />
                    </>
                  </FormControl>
                  <FormMessage className="border-none bg-customgreys-darkGrey p-4" />
                </FormItem>
              )}
            />

            <div className="chapter-modal__actions">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary-700">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </CustomModal>
  );
};

export default ChapterModal;
