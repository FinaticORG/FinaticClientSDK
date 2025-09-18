"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Monitor, Paintbrush, Download, Upload, RefreshCw } from "lucide-react"
import { useState } from "react"

const colorPresets = [
  {
    name: "Default Dark",
    primary: "#6366f1",
    secondary: "#1f2937",
    accent: "#3b82f6",
    background: "#0f172a",
    foreground: "#f8fafc",
  },
  {
    name: "Ocean Blue",
    primary: "#0ea5e9",
    secondary: "#164e63",
    accent: "#06b6d4",
    background: "#0c4a6e",
    foreground: "#f0f9ff",
  },
  {
    name: "Forest Green",
    primary: "#10b981",
    secondary: "#064e3b",
    accent: "#059669",
    background: "#022c22",
    foreground: "#ecfdf5",
  },
  {
    name: "Sunset Orange",
    primary: "#f59e0b",
    secondary: "#92400e",
    accent: "#d97706",
    background: "#451a03",
    foreground: "#fffbeb",
  },
]

const fontOptions = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Source Sans Pro", value: "Source Sans Pro, sans-serif" },
  { name: "JetBrains Mono", value: "JetBrains Mono, monospace" },
]

export function ThemingSystem() {
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [customColors, setCustomColors] = useState({
    primary: "#6366f1",
    secondary: "#1f2937",
    accent: "#3b82f6",
    background: "#0f172a",
    foreground: "#f8fafc",
  })
  const [borderRadius, setBorderRadius] = useState([8])
  const [fontSize, setFontSize] = useState([16])
  const [darkMode, setDarkMode] = useState(true)
  const [selectedFont, setSelectedFont] = useState("Inter, sans-serif")

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Theming System</h1>
          <p className="text-muted-foreground">Customize the appearance and styling of your application</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
            <Upload className="w-4 h-4 mr-2" />
            Import Theme
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Export Theme
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Theme Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="colors" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-muted">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Color Palette</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Customize your application's color scheme
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-foreground">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={customColors.primary}
                          onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                          className="w-12 h-10 p-1 border-border"
                        />
                        <Input
                          value={customColors.primary}
                          onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={customColors.secondary}
                          onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                          className="w-12 h-10 p-1 border-border"
                        />
                        <Input
                          value={customColors.secondary}
                          onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={customColors.accent}
                          onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                          className="w-12 h-10 p-1 border-border"
                        />
                        <Input
                          value={customColors.accent}
                          onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={customColors.background}
                          onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                          className="w-12 h-10 p-1 border-border"
                        />
                        <Input
                          value={customColors.background}
                          onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-foreground">Dark Mode</Label>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Typography Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">Configure fonts and text styling</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-foreground">Font Family</Label>
                    <Select value={selectedFont} onValueChange={setSelectedFont}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Base Font Size: {fontSize[0]}px</Label>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      max={24}
                      min={12}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-foreground">Typography Preview</Label>
                    <div className="space-y-2 p-4 border border-border rounded-lg bg-muted/50">
                      <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: selectedFont }}>
                        Heading 1 - Main Title
                      </h1>
                      <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: selectedFont }}>
                        Heading 2 - Section Title
                      </h2>
                      <p className="text-foreground" style={{ fontFamily: selectedFont, fontSize: `${fontSize[0]}px` }}>
                        Body text - This is how your regular content will appear with the selected font and size
                        settings.
                      </p>
                      <p className="text-sm text-muted-foreground" style={{ fontFamily: selectedFont }}>
                        Small text - Used for captions and secondary information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Layout Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Adjust spacing and component styling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-foreground">Border Radius: {borderRadius[0]}px</Label>
                    <Slider
                      value={borderRadius}
                      onValueChange={setBorderRadius}
                      max={20}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-foreground">Component Preview</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Button
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          style={{ borderRadius: `${borderRadius[0]}px` }}
                        >
                          Primary Button
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-border text-foreground hover:bg-accent bg-transparent"
                          style={{ borderRadius: `${borderRadius[0]}px` }}
                        >
                          Secondary Button
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Input field"
                          className="bg-input border-border text-foreground"
                          style={{ borderRadius: `${borderRadius[0]}px` }}
                        />
                        <div
                          className="p-3 bg-card border border-border"
                          style={{ borderRadius: `${borderRadius[0]}px` }}
                        >
                          <p className="text-sm text-foreground">Card component with custom border radius</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="presets" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Theme Presets</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Choose from pre-built color schemes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {colorPresets.map((preset, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPreset === index
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => {
                          setSelectedPreset(index)
                          setCustomColors({
                            primary: preset.primary,
                            secondary: preset.secondary,
                            accent: preset.accent,
                            background: preset.background,
                            foreground: preset.foreground,
                          })
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-foreground">{preset.name}</h3>
                          {selectedPreset === index && <Badge variant="default">Active</Badge>}
                        </div>
                        <div className="flex gap-2">
                          <div
                            className="w-6 h-6 rounded-full border border-border"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border border-border"
                            style={{ backgroundColor: preset.secondary }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border border-border"
                            style={{ backgroundColor: preset.accent }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border border-border"
                            style={{ backgroundColor: preset.background }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Live Preview</CardTitle>
              <CardDescription className="text-muted-foreground">See your changes in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Sample Component</h3>
                  <Badge style={{ backgroundColor: customColors.primary, color: customColors.foreground }}>New</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  This preview shows how your theme changes will look in the actual application.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    style={{
                      backgroundColor: customColors.primary,
                      color: customColors.foreground,
                      borderRadius: `${borderRadius[0]}px`,
                    }}
                  >
                    Primary
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{
                      borderColor: customColors.primary,
                      color: customColors.primary,
                      borderRadius: `${borderRadius[0]}px`,
                    }}
                  >
                    Secondary
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Theme Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Paintbrush className="w-4 h-4 mr-2" />
                Apply Theme
              </Button>
              <Button variant="outline" className="w-full border-border text-foreground hover:bg-accent bg-transparent">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
