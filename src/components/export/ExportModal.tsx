import { useState } from "react";
import { api } from "@/lib/api";
import { exportEntries, downloadExport, type ExportFormat, type ExportOptions } from "@/lib/exportService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Download,
  X,
  FileText,
  FileJson,
  Calendar,
  CheckSquare,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DateRangeType = "all" | "custom";

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("markdown");
  const [includeThoughts, setIncludeThoughts] = useState(true);
  const [includeDiet, setIncludeDiet] = useState(true);
  const [includeExercise, setIncludeExercise] = useState(true);
  const [includeTodos, setIncludeTodos] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let entries;
      if (dateRangeType === "all") {
        entries = await api.getAllEntries();
      } else {
        entries = await api.getEntriesByDateRange(startDate, endDate);
      }

      // Filter out empty entries
      const nonEmptyEntries = entries.filter(e =>
        e.thoughts ||
        e.diet.breakfast || e.diet.lunch || e.diet.dinner || e.diet.snacks ||
        e.exercises.length > 0 ||
        (e.todos?.length ?? 0) > 0
      );

      const options: ExportOptions = {
        format: exportFormat,
        includeThoughts,
        includeDiet,
        includeExercise,
        includeTodos,
      };

      const content = exportEntries(nonEmptyEntries, options);
      downloadExport(content, exportFormat);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const loadPreviewCount = async () => {
    try {
      let entries;
      if (dateRangeType === "all") {
        entries = await api.getAllEntries();
      } else if (startDate && endDate) {
        entries = await api.getEntriesByDateRange(startDate, endDate);
      } else {
        setPreviewCount(null);
        return;
      }

      const nonEmptyEntries = entries.filter(e =>
        e.thoughts ||
        e.diet.breakfast || e.diet.lunch || e.diet.dinner || e.diet.snacks ||
        e.exercises.length > 0 ||
        (e.todos?.length ?? 0) > 0
      );
      setPreviewCount(nonEmptyEntries.length);
    } catch {
      setPreviewCount(null);
    }
  };

  // Load preview when modal opens or date range changes
  useState(() => {
    if (isOpen) {
      loadPreviewCount();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-lg mx-4 animate-in zoom-in-95 fade-in duration-200 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-lg shadow-sm border">
              <Download className="h-5 w-5 text-indigo-500" />
            </div>
            <CardTitle className="text-xl font-serif font-bold">Export Diary</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Date Range Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date Range
            </Label>
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDateRangeType("all");
                    setTimeout(loadPreviewCount, 100);
                  }}
                  className={cn(
                    "flex-1 p-3 rounded-lg border-2 transition-all text-sm font-medium",
                    dateRangeType === "all"
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-600"
                      : "border-border hover:border-indigo-500/50 hover:bg-secondary/50"
                  )}
                >
                  Export All
                </button>
                <button
                  onClick={() => setDateRangeType("custom")}
                  className={cn(
                    "flex-1 p-3 rounded-lg border-2 transition-all text-sm font-medium",
                    dateRangeType === "custom"
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-600"
                      : "border-border hover:border-indigo-500/50 hover:bg-secondary/50"
                  )}
                >
                  Custom Range
                </button>
              </div>

              {dateRangeType === "custom" && (
                <div className="flex gap-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (e.target.value && endDate) {
                          setTimeout(loadPreviewCount, 100);
                        }
                      }}
                      className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">End Date</Label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        if (startDate && e.target.value) {
                          setTimeout(loadPreviewCount, 100);
                        }
                      }}
                      className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="flex gap-3">
              <button
                onClick={() => setExportFormat("markdown")}
                className={cn(
                  "flex-1 p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                  exportFormat === "markdown"
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-border hover:border-indigo-500/50 hover:bg-secondary/50"
                )}
              >
                <FileText className={cn(
                  "h-6 w-6",
                  exportFormat === "markdown" ? "text-indigo-500" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  exportFormat === "markdown" ? "text-indigo-600" : "text-foreground"
                )}>Markdown</span>
              </button>
              <button
                onClick={() => setExportFormat("json")}
                className={cn(
                  "flex-1 p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                  exportFormat === "json"
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-border hover:border-indigo-500/50 hover:bg-secondary/50"
                )}
              >
                <FileJson className={cn(
                  "h-6 w-6",
                  exportFormat === "json" ? "text-indigo-500" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  exportFormat === "json" ? "text-indigo-600" : "text-foreground"
                )}>JSON</span>
              </button>
            </div>
          </div>

          {/* Content Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              Include Content
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "thoughts", label: "Thoughts", checked: includeThoughts, onChange: setIncludeThoughts, color: "blue" },
                { id: "diet", label: "Diet", checked: includeDiet, onChange: setIncludeDiet, color: "green" },
                { id: "exercise", label: "Exercise", checked: includeExercise, onChange: setIncludeExercise, color: "orange" },
                { id: "todos", label: "Tasks", checked: includeTodos, onChange: setIncludeTodos, color: "purple" },
              ].map((item) => (
                <label
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                    item.checked
                      ? `bg-${item.color}-500/10 border-${item.color}-500/50`
                      : "border-border hover:bg-secondary/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.onChange(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preview & Export Button */}
          <div className="space-y-3 pt-2">
            {previewCount !== null && (
              <p className="text-sm text-center text-muted-foreground">
                Will export <span className="font-semibold text-foreground">{previewCount}</span> {previewCount === 1 ? "entry" : "entries"}
              </p>
            )}
            <Button
              onClick={handleExport}
              disabled={isExporting || (dateRangeType === "custom" && (!startDate || !endDate))}
              className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white font-medium"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
