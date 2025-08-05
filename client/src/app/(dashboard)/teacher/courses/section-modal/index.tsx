import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { SectionFormData, sectionSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { addSection, closeSectionModal, editSection } from "@/state";
import CustomModal from "@/components/custom-modal";
import { X } from "lucide-react";
import { Form } from "@/components/ui/form";
import { CustomFormField } from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";

const SectionModal = () => {
  const dispatch = useAppDispatch();
  const {
    isSectionModalOpen,

    selectedSectionIndex,
    sections,
  } = useAppSelector((state) => state.global.courseEditor);

  const section =
    selectedSectionIndex !== null ? sections[selectedSectionIndex] : null;

  const methods = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // if chapter exists, reset the form with the chapter data
  // if chapter does not exist, reset the form with the default values
  useEffect(() => {
    if (section) {
      methods.reset({
        title: section.sectionTitle,
        description: section.sectionDescription,
      });
    } else {
      methods.reset({
        title: "",
        description: "",
      });
    }
  }, [section, methods]);

  const onClose = () => {
    dispatch(closeSectionModal());
  };

  const onSubmit = (data: SectionFormData) => {
    // create new chapter object with the form data
    const newSection: Section = {
      sectionId: section?.sectionId || uuidv4(),
      sectionTitle: data.title,
      sectionDescription: data.description,
      chapters: section?.chapters || [],
    };

    // if chapter does not exist, add it
    // if chapter exists, edit it
    if (selectedSectionIndex === null) {
      dispatch(addSection(newSection));
    } else {
      dispatch(
        editSection({
          index: selectedSectionIndex,
          section: newSection,
        })
      );
    }

    toast.success(
      "Section added successfully but you need to save the course to apply the changes"
    );
    onClose();
  };

  return (
    <CustomModal isOpen={isSectionModalOpen} onClose={onClose}>
      <div className="section-modal">
        <div className="section-modal__header">
          <h2 className="section-modal__title">Add/Edit Chapter</h2>
          <button onClick={onClose} className="section-modal__close">
            <X className="w-6 h-6" />
          </button>
        </div>

        <Form {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="section-modal__form"
          >
            <CustomFormField
              name="title"
              label="Section Title"
              placeholder="Write section title here"
            />

            <CustomFormField
              name="description"
              label="Section Description"
              placeholder="Write section description here"
              type="textarea"
            />

            <div className="section-modal__actions">
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

export default SectionModal;
