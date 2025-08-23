import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Loader2, Save } from "lucide-react";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  defaultTheme: string;
  enableRegistration: boolean;
  enableEmailVerification: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireStrongPassword: boolean;
}

const defaultSettings: SystemSettings = {
  siteName: "Admin System",
  siteDescription: "Modern admin system with dynamic role management",
  defaultTheme: "system",
  enableRegistration: true,
  enableEmailVerification: true,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireStrongPassword: true,
};

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current settings
  const { data: currentSettings, isLoading } = useSWR(
    "/api/admin/system-settings",
    async () => {
      // Simulate API call
      return defaultSettings;
    }
  );

  // Save settings mutation
  const { trigger: saveSettings, isMutating } = useSWRMutation(
    "/api/admin/system-settings",
    async (url, { arg }: { arg: SystemSettings }) => {
      // Simulate API call
      console.log("Saving settings:", arg);
      return arg;
    },
    {
      onSuccess: () => {
        setHasChanges(false);
      },
    }
  );

  const handleSettingChange = <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettings(settings);
  };

  const handleReset = () => {
    setSettings(currentSettings || defaultSettings);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">
            Configure your admin system settings and preferences
          </p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={isMutating}>
              {isMutating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleSettingChange("siteName", e.target.value)}
                placeholder="Enter site name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange("siteDescription", e.target.value)}
                placeholder="Enter site description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultTheme">Default Theme</Label>
              <Select
                value={settings.defaultTheme}
                onValueChange={(value) => handleSettingChange("defaultTheme", value)}
              >
                <SelectTrigger id="defaultTheme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register accounts
                </p>
              </div>
              <Switch
                checked={settings.enableRegistration}
                onCheckedChange={(checked) => handleSettingChange("enableRegistration", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require email verification for new accounts
                </p>
              </div>
              <Switch
                checked={settings.enableEmailVerification}
                onCheckedChange={(checked) => handleSettingChange("enableEmailVerification", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Strong Password</Label>
                <p className="text-sm text-muted-foreground">
                  Enforce strong password requirements
                </p>
              </div>
              <Switch
                checked={settings.requireStrongPassword}
                onCheckedChange={(checked) => handleSettingChange("requireStrongPassword", checked)}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange("sessionTimeout", parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleSettingChange("maxLoginAttempts", parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Password Min Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  min="6"
                  max="32"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleSettingChange("passwordMinLength", parseInt(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}