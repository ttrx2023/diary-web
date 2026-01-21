import { useEffect, useState } from "react";
import { useDiaryEntry } from "@/hooks/useDiary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TodoItem } from "@/types/index";
import { Plus, Trash2, CheckSquare, Square, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoSectionProps {
  date: string;
}

export function TodoSection({ date }: TodoSectionProps) {
  const { entry, updateEntry, isSaving, isLoading } = useDiaryEntry(date);
  const [todos, setTodos] = useState<TodoItem[]>(entry?.todos ?? []);
  const [newTodoText, setNewTodoText] = useState("");

  useEffect(() => {
    setTodos(entry?.todos ?? []);
  }, [entry?.todos]);

  const save = (newTodos: TodoItem[]) => {
    if (!entry) return;
    updateEntry({ ...entry, todos: newTodos });
  };

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
    const newList = todos.map((t) => {
      if (t.id === id) {
        return { ...t, text };
      }
      return t;
    });
    setTodos(newList);
  };

  const handleBlur = () => {
    save(todos);
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-lg shadow-sm border">
            <ListTodo className="h-5 w-5 text-purple-500" />
          </div>
          <CardTitle className="text-xl font-serif font-bold">Today's Tasks</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground font-medium">
              {completedCount}/{totalCount}
            </span>
          )}
          {isSaving && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Saving
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
          <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading tasks...
          </div>
        )}

        {!isLoading && todos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 bg-secondary/5">
            <div className="p-3 bg-secondary rounded-full">
              <CheckSquare className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">No tasks yet</p>
              <p className="text-sm text-muted-foreground">Add your first task for today</p>
            </div>
          </div>
        )}

        {/* Todo List */}
        <div className="divide-y divide-border/50">
          {todos.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-4 transition-all hover:bg-secondary/30 group animate-in fade-in slide-in-from-bottom-2 duration-300",
                item.completed && "bg-secondary/20"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(item.id)}
                className={cn(
                  "flex-shrink-0 transition-all duration-200 hover:scale-110",
                  item.completed ? "text-purple-500" : "text-muted-foreground hover:text-purple-500"
                )}
              >
                {item.completed ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>

              {/* Text Input */}
              <Input
                value={item.text}
                onChange={(e) => updateTodoText(item.id, e.target.value)}
                onBlur={handleBlur}
                className={cn(
                  "flex-1 border-transparent bg-transparent hover:bg-background focus:bg-background focus:border-input shadow-none px-2 h-9 rounded-sm transition-all",
                  item.completed && "line-through text-muted-foreground"
                )}
              />

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTodo(item.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="px-4 py-3 border-t bg-secondary/10">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Progress</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Add New Todo */}
        <div className="p-4 border-t bg-secondary/10">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !entry}
              className="flex-1 bg-background"
            />
            <Button
              onClick={addTodo}
              disabled={isLoading || !entry || !newTodoText.trim()}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
