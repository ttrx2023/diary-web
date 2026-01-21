import { cn } from "@/lib/utils";

interface SaveProgressBarProps {
  status: "idle" | "saving" | "saved";
  className?: string;
}

export function SaveProgressBar({ status, className }: SaveProgressBarProps) {
  if (status === "idle") {
    return null;
  }

  return (
    <div className={cn("h-[2px] w-full overflow-hidden", className)}>
      <div
        className={cn(
          "h-full transition-all duration-300 ease-out",
          status === "saving" && "animate-save-progress bg-primary/60",
          status === "saved" && "w-full bg-green-500 animate-save-complete"
        )}
      />
    </div>
  );
}
