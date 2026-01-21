import type { DailyEntry } from "@/types/index";
import { format } from "date-fns";

export type ExportFormat = "markdown" | "json";

export interface ExportOptions {
  format: ExportFormat;
  includeThoughts: boolean;
  includeDiet: boolean;
  includeExercise: boolean;
  includeTodos: boolean;
}

// Convert entries to Markdown format
function toMarkdown(entries: DailyEntry[], options: ExportOptions): string {
  const lines: string[] = [];

  lines.push("# My Diary Export");
  lines.push("");
  lines.push(`> Exported on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`);
  lines.push(`> Total entries: ${entries.length}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const entry of entries) {
    const dateObj = new Date(`${entry.date}T00:00:00`);
    lines.push(`## ${format(dateObj, "EEEE, MMMM d, yyyy")}`);
    lines.push("");

    // Thoughts
    if (options.includeThoughts && entry.thoughts) {
      lines.push("### 💭 Thoughts & Reflection");
      lines.push("");
      lines.push(entry.thoughts);
      lines.push("");
    }

    // Diet
    if (options.includeDiet) {
      const hasDiet = entry.diet.breakfast || entry.diet.lunch || entry.diet.dinner || entry.diet.snacks;
      if (hasDiet) {
        lines.push("### 🍽️ Diet");
        lines.push("");
        if (entry.diet.breakfast) lines.push(`- **Breakfast:** ${entry.diet.breakfast}`);
        if (entry.diet.lunch) lines.push(`- **Lunch:** ${entry.diet.lunch}`);
        if (entry.diet.dinner) lines.push(`- **Dinner:** ${entry.diet.dinner}`);
        if (entry.diet.snacks) lines.push(`- **Snacks:** ${entry.diet.snacks}`);
        lines.push("");
      }
    }

    // Exercise
    if (options.includeExercise && entry.exercises.length > 0) {
      lines.push("### 🏃 Exercise");
      lines.push("");
      for (const ex of entry.exercises) {
        lines.push(`- **${ex.name || "Unnamed"}:** ${ex.value} ${ex.unit}`);
      }
      lines.push("");
    }

    // Todos
    if (options.includeTodos && entry.todos?.length > 0) {
      const completed = entry.todos.filter(t => t.completed).length;
      const total = entry.todos.length;
      lines.push("### ✅ Tasks");
      lines.push("");
      for (const todo of entry.todos) {
        const checkbox = todo.completed ? "[x]" : "[ ]";
        lines.push(`- ${checkbox} ${todo.text}`);
      }
      lines.push("");
      lines.push(`> Completed: ${completed}/${total} (${total > 0 ? Math.round((completed / total) * 100) : 0}%)`);
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

// Convert entries to JSON format
function toJSON(entries: DailyEntry[], options: ExportOptions): string {
  const filtered = entries.map(entry => {
    const result: Partial<DailyEntry> = {
      date: entry.date,
    };

    if (options.includeThoughts) {
      result.thoughts = entry.thoughts;
    }
    if (options.includeDiet) {
      result.diet = entry.diet;
    }
    if (options.includeExercise) {
      result.exercises = entry.exercises;
    }
    if (options.includeTodos) {
      result.todos = entry.todos;
    }

    return result;
  });

  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    totalEntries: entries.length,
    entries: filtered,
  }, null, 2);
}

// Main export function
export function exportEntries(entries: DailyEntry[], options: ExportOptions): string {
  // Sort entries by date
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  switch (options.format) {
    case "markdown":
      return toMarkdown(sorted, options);
    case "json":
      return toJSON(sorted, options);
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
}

// Trigger file download
export function downloadExport(content: string, exportFormat: ExportFormat): void {
  const timestamp = format(new Date(), "yyyy-MM-dd");
  const extension = exportFormat === "markdown" ? "md" : "json";
  const mimeType = exportFormat === "markdown" ? "text/markdown" : "application/json";
  const filename = `diary-export-${timestamp}.${extension}`;

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
