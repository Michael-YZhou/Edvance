import React from "react";
import SharedNotificationSettings from "@/components/shared-notification-settings";

const userSettings = () => {
  return (
    <div className="w-3/5">
      <SharedNotificationSettings
        title="Notification Settings"
        subtitle="Manage your notification settings"
      />
    </div>
  );
};

export default userSettings;
