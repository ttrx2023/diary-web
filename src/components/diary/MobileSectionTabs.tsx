import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, PenLine, Utensils, Lightbulb, Dumbbell, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionType = "thoughts" | "diet" | "discovery" | "todo" | "exercise";

interface MobileSectionTabsProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  date: string;
  onDateChange: (date: string) => void;
}

const sections: { id: SectionType; icon: typeof PenLine }[] = [
  { id: "thoughts", icon: PenLine },
  { id: "diet", icon: Utensils },
  { id: "discovery", icon: Lightbulb },
  { id: "todo", icon: CheckSquare },
  { id: "exercise", icon: Dumbbell },
];

export function MobileSectionTabs({
  activeSection,
  onSectionChange,
  date,
  onDateChange,
}: MobileSectionTabsProps) {
  const navigate = useNavigate();
  const lastClickTimeRef = useRef<number>(0);
  const lastClickSectionRef = useRef<SectionType | null>(null);

  const goToPreviousDay = () => {
    const current = new Date(date);
    current.setDate(current.getDate() - 1);
    onDateChange(current.toISOString().split("T")[0]);
  };

  const goToNextDay = () => {
    const current = new Date(date);
    current.setDate(current.getDate() + 1);
    onDateChange(current.toISOString().split("T")[0]);
  };

  const handleSectionClick = (sectionId: SectionType) => {
    const now = Date.now();
    const isDoubleClick =
      lastClickSectionRef.current === sectionId &&
      now - lastClickTimeRef.current < 300;

    // If double-clicking on exercise while already active, go directly to exercise history
    if (sectionId === "exercise" && activeSection === "exercise" && isDoubleClick) {
      navigate("/statistics?section=exercise");
      return;
    }

    // Update tracking refs
    lastClickTimeRef.current = now;
    lastClickSectionRef.current = sectionId;

    // Normal section change
    onSectionChange(sectionId);
  };

  return (
    <div className="flex items-center justify-between px-1 py-1.5 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
      {/* Left Arrow */}
      <button
        onClick={goToPreviousDay}
        className="p-2 rounded-md text-muted-foreground hover:bg-secondary/50 active:scale-95 transition-all"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Section Tabs - Icon Only */}
      <div className="flex items-center gap-1 flex-1 justify-center">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleSectionClick(section.id)}
            className={cn(
              "relative flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 active:scale-95",
              activeSection === section.id
                ? "text-primary"
                : "text-muted-foreground hover:bg-secondary/50"
            )}
          >
            <section.icon className={cn(
              "h-5 w-5 transition-transform",
              activeSection === section.id && "scale-110"
            )} />
            {/* Active Indicator Dot */}
            {activeSection === section.id && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={goToNextDay}
        className="p-2 rounded-md text-muted-foreground hover:bg-secondary/50 active:scale-95 transition-all"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
