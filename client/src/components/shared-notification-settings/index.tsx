"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { useUpdateUserMutation } from "@/state/api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  notificationSettingsSchema,
  type NotificationSettingsFormData,
} from "@/lib/schemas";
import Header from "../header";
import { Form } from "../ui/form";
import { CustomFormField } from "../CustomFormField";
import { Button } from "../ui/button";

const SharedNotificationSettings = ({
  title = "Notification Settings",
  subtitle = "Manage your notification settings",
}: SharedNotificationSettingsProps) => {
  const { user } = useUser();
  const [updateUser] = useUpdateUserMutation();

  // Treat user.publicMetadata as an object that has a settings property of type UserSettings
  const currentSettings =
    (user?.publicMetadata as { settings: UserSettings })?.settings || {};

  const defaultSettings = {
    courseNotifications: currentSettings.courseNotifications || false,
    emailAlerts: currentSettings.emailAlerts || false,
    smsAlerts: currentSettings.smsAlerts || false,
    notificationFrequency: currentSettings.notificationFrequency || "daily",
  };

  const methods = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: defaultSettings,
  });

  const onSubmit = async (data: NotificationSettingsFormData) => {
    if (!user) return;

    const updatedUser = {
      userId: user.id,
      publicMetadata: {
        ...user.publicMetadata,
        settings: {
          ...currentSettings,
          ...data,
        },
      },
    };

    try {
      await updateUser(updatedUser);
    } catch (error) {
      console.error("Failed to update user settings: ", error);
    }
  };

  if (!user) return <div>Please sign in to manage your user settings.</div>;

  return (
    <div className="notification-settings">
      <Header title={title} subtitle={subtitle} />
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="notification-settings__form"
        >
          <div className="notification-settings__fields">
            <CustomFormField
              name="courseNotifications"
              label="Course Notifications"
              type="switch"
            />
            <CustomFormField
              name="emailAlerts"
              label="Email Alerts"
              type="switch"
            />
            <CustomFormField
              name="smsAlerts"
              label="SMS Alerts"
              type="switch"
            />
            <CustomFormField
              name="notificationFrequency"
              label="Notification Frequency"
              type="select"
              options={[
                { value: "immediate", label: "Immediate" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
              ]}
            />
          </div>

          <Button type="submit" className="notification-settings__submit">
            Update Settings
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SharedNotificationSettings;
