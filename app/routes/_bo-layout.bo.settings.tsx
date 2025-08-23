import { SystemSettings } from "~/components/admin/settings/system-settings";

const BOSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure your admin system settings and preferences
        </p>
      </div>
      <SystemSettings />
    </div>
  );
};
export default BOSettings;