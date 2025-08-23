import { AppearanceSettings } from "~/components/admin/settings/appearance-settings";

const BOAppearance = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appearance</h1>
        <p className="text-muted-foreground">
          Customize the look and feel of your admin system
        </p>
      </div>
      <AppearanceSettings />
    </div>
  );
};
export default BOAppearance;