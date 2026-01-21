import { useEffect, useState, useRef, useCallback } from "react";
import { useDiaryEntry } from "@/hooks/useDiary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TodoItem } from "@/types/index";
import { Plus, Trash2, CheckSquare, Square, ListTodo, GripVertical, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TodoSectionProps {
  date: string;
}

interface SortableTodoItemProps {
  item: TodoItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onBlur: () => void;
}

function SortableTodoItem({ item, onToggle, onRemove, onUpdateText, onBlur }: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 transition-all hover:bg-secondary/30 group",
        item.completed && "bg-secondary/20",
        isDragging && "opacity-50 bg-secondary/50 shadow-lg z-50 rounded-lg"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(item.id)}
        className={cn(
          "flex-shrink-0 transition-all duration-200 hover:scale-110",
          item.completed ? "text-purple-500" : "text-muted-foreground hover:text-purple-500"
        )}
      >
        {item.completed ? (
          <CheckSquare className="h-4 w-4" />
        ) : (
          <Square className="h-4 w-4" />
        )}
      </button>

      {/* Text Input */}
      <Input
        value={item.text}
        onChange={(e) => onUpdateText(item.id, e.target.value)}
        onBlur={onBlur}
        className={cn(
          "flex-1 border-transparent bg-transparent hover:bg-background focus:bg-background focus:border-input shadow-none px-2 h-8 text-sm rounded-sm transition-all",
          item.completed && "line-through text-muted-foreground"
        )}
      />

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.id)}
        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function TodoSection({ date }: TodoSectionProps) {
  const { entry, updateEntry, isLoading } = useDiaryEntry(date);
  const [todos, setTodos] = useState<TodoItem[]>(entry?.todos ?? []);
  const [newTodoText, setNewTodoText] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Use ref to always have access to latest todos value (fixes race condition)
  const todosRef = useRef<TodoItem[]>(todos);
  const isEditingRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync todos with entry, but only if not currently editing
  useEffect(() => {
    if (!isEditingRef.current) {
      setTodos(entry?.todos ?? []);
      todosRef.current = entry?.todos ?? [];
    }
  }, [entry?.todos]);

  // Keep ref in sync with state
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  const save = useCallback((newTodos: TodoItem[]) => {
    if (!entry) return;
    setSaveStatus("saving");
    updateEntry({ ...entry, todos: newTodos });

    // Show saved status briefly
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }, 300);
  }, [entry, updateEntry]);

  const addTodo = () => {
    if (!newTodoText.trim()) return;

    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const newList = [...todos, newItem];
    setTodos(newList);
    setNewTodoText("");
    save(newList);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTodo();
    }
  };

  const toggleTodo = (id: string) => {
    const newList = todos.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    setTodos(newList);
    save(newList);
  };

  const removeTodo = (id: string) => {
    const newList = todos.filter((t) => t.id !== id);
    setTodos(newList);
    save(newList);
  };

  const updateTodoText = (id: string, text: string) => {
    isEditingRef.current = true;
    const newList = todos.map((t) => {
      if (t.id === id) {
        return { ...t, text };
      }
      return t;
    });
    setTodos(newList);
  };

  const handleBlur = () => {
    // Use ref to get the latest todos value
    isEditingRef.current = false;
    save(todosRef.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex((t) => t.id === active.id);
      const newIndex = todos.findIndex((t) => t.id === over.id);
      const newList = arrayMove(todos, oldIndex, newIndex);
      setTodos(newList);
      save(newList);
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 border-b bg-secondary/20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-background rounded-md shadow-sm border">
            <ListTodo className="h-4 w-4 text-purple-500" />
          </div>
          <CardTitle className="text-base font-serif font-bold">Tasks</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {/* Save Status Indicator */}
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-medium transition-all duration-300",
            saveStatus === "idle" && "opacity-0",
            saveStatus === "saving" && "text-muted-foreground opacity-100",
            saveStatus === "saved" && "text-green-600 opacity-100"
          )}>
            {saveStatus === "saving" && (
              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
            )}
            {saveStatus === "saved" && (
              <Check className="h-3 w-3" />
            )}
            <span>{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : ""}</span>
          </div>

          {/* Mini Progress Bar with x/y inside */}
          {totalCount > 0 && (
            <div className={cn(
              "relative w-16 h-5 bg-secondary rounded-full overflow-hidden transition-all duration-300",
              saveStatus === "saving" && "animate-pulse"
            )}>
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground mix-blend-difference">
                {completedCount}/{totalCount}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col flex-1 min-h-0">
        {isLoading && (
          <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
            Loading tasks...
          </div>
        )}

        {!isLoading && todos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 bg-secondary/5 flex-1">
            <div className="p-2 bg-secondary rounded-full">
              <CheckSquare className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">No tasks yet</p>
              <p className="text-xs text-muted-foreground">Add your first task</p>
            </div>
          </div>
        )}

        {/* Scrollable Todo List */}
        {!isLoading && todos.length > 0 && (
          <div className="relative flex-1 min-h-0">
            <div className="max-h-[280px] overflow-y-auto scrollbar-thin">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="divide-y divide-border/30">
                    {todos.map((item) => (
                      <SortableTodoItem
                        key={item.id}
                        item={item}
                        onToggle={toggleTodo}
                        onRemove={removeTodo}
                        onUpdateText={updateTodoText}
                        onBlur={handleBlur}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
            {/* Fade overlay for scroll indication */}
            {todos.length > 5 && (
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            )}
          </div>
        )}

        {/* Add New Todo */}
        <div className="p-3 border-t bg-secondary/10 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !entry}
              className="flex-1 bg-background h-9 text-sm"
            />
            <Button
              onClick={addTodo}
              disabled={isLoading || !entry || !newTodoText.trim()}
              size="sm"
              className="bg-purple-500 hover:bg-purple-600 text-white h-9 px-3"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
