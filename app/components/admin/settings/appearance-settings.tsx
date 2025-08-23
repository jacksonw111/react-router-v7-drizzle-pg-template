import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { Palette, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "~/lib/utils";

interface ThemeConfig {
  name: string;
  value: string;
  icon: React.ElementType;
  description: string;
}

const themes: ThemeConfig[] = [
  {
    name: "Light",
    value: "light",
    icon: Sun,
    description: "Clean and bright interface",
  },
  {
    name: "Dark",
    value: "dark",
    icon: Moon,
    description: "Easy on the eyes in low light",
  },
  {
    name: "System",
    value: "system",
    icon: Monitor,
    description: "Automatically adjust to your system",
  },
];

interface ColorScheme {
  name: string;
  value: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
  };
}

const colorSchemes: ColorScheme[] = [
  {
    name: "Default",
    value: "default",
    colors: {
      background: "hsl(0 0% 100%)",
      foreground: "hsl(222.2 84% 4.9%)",
      primary: "hsl(221.2 83.2% 53.3%)",
      secondary: "hsl(210 40% 96.1%)",
      accent: "hsl(221.2 83.2% 53.3%)",
    },
  },
  {
    name: "Neutral",
    value: "neutral",
    colors: {
      background: "hsl(0 0% 100%)",
      foreground: "hsl(215 20.2% 65.1%)",
      primary: "hsl(215 25% 27%)",
      secondary: "hsl(215 20.2% 95.1%)",
      accent: "hsl(215 25% 27%)",
    },
  },
  {
    name: "Warm",
    value: "warm",
    colors: {
      background: "hsl(20 14.3% 95.9%)",
      foreground: "hsl(25 5.3% 44.7%)",
      primary: "hsl(25 95% 53%)",
      secondary: "hsl(20 14.3% 85.9%)",
      accent: "hsl(25 95% 53%)",
    },
  },
  {
    name: "Cool",
    value: "cool",
    colors: {
      background: "hsl(206 50% 98%)",
      foreground: "hsl(215 28% 17%)",
      primary: "hsl(206 90% 50%)",
      secondary: "hsl(206 50% 95%)",
      accent: "hsl(206 90% 50%)",
    },
  },
];

export function AppearanceSettings() {
  const [selectedTheme, setSelectedTheme] = useState("system");
  const [selectedColorScheme, setSelectedColorScheme] = useState("default");
  const [hasChanges, setHasChanges] = useState(false);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    setHasChanges(true);
  };

  const handleColorSchemeChange = (scheme: string) => {
    setSelectedColorScheme(scheme);
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save appearance settings
    console.log("Saving appearance settings:", {
      theme: selectedTheme,
      colorScheme: selectedColorScheme,
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setSelectedTheme("system");
    setSelectedColorScheme("default");
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Appearance Settings</h2>
          <p className="text-muted-foreground">
            Customize the look and feel of your admin system
          </p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Theme Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme
            </CardTitle>
            <CardDescription>Choose your preferred theme</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedTheme} onValueChange={handleThemeChange}>
              <div className="grid gap-4">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <label
                      key={theme.value}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                        selectedTheme === theme.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-accent/50"
                      )}
                    >
                      <RadioGroupItem value={theme.value} className="sr-only" />
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{theme.name}</p>
                        <p className="text-sm text-muted-foreground">{theme.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Color Scheme */}
        <Card>
          <CardHeader>
            <CardTitle>Color Scheme</CardTitle>
            <CardDescription>Choose your preferred color palette</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedColorScheme} onValueChange={handleColorSchemeChange}>
              <div className="grid grid-cols-2 gap-4">
                {colorSchemes.map((scheme) => (
                  <label
                    key={scheme.value}
                    className={cn(
                      "relative rounded-lg border p-4 cursor-pointer transition-all",
                      selectedColorScheme === scheme.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent/50"
                    )}
                  >
                    <RadioGroupItem value={scheme.value} className="sr-only" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{scheme.name}</span>
                        {selectedColorScheme === scheme.value && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <div
                          className="h-6 w-6 rounded border"
                          style={{ backgroundColor: scheme.colors.background }}
                        />
                        <div
                          className="h-6 w-6 rounded border"
                          style={{ backgroundColor: scheme.colors.primary }}
                        />
                        <div
                          className="h-6 w-6 rounded border"
                          style={{ backgroundColor: scheme.colors.secondary }}
                        />
                        <div
                          className="h-6 w-6 rounded border"
                          style={{ backgroundColor: scheme.colors.accent }}
                        />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your changes will look</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Sample Interface</h3>
                <Button size="sm">Action Button</Button>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Primary</Label>
                  <div className="h-8 w-full rounded bg-primary" />
                </div>
                <div className="space-y-2">
                  <Label>Secondary</Label>
                  <div className="h-8 w-full rounded bg-secondary" />
                </div>
                <div className="space-y-2">
                  <Label>Accent</Label>
                  <div className="h-8 w-full rounded bg-accent" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}