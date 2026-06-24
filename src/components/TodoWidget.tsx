import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { TodoItem } from '../types';

export default function TodoWidget() {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('widget_todos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      { id: '1', text: 'Plan weekly project sprints', completed: false },
      { id: '2', text: 'Review pull requests', completed: true },
    ];
  });

  const [input, setInput] = useState('');

  const saveTodos = (list: TodoItem[]) => {
    setTodos(list);
    localStorage.setItem('widget_todos', JSON.stringify(list));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
    };

    saveTodos([...todos, newItem]);
    setInput('');
  };

  const handleToggle = (id: string) => {
    const updated = todos.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveTodos(updated);
  };

  const handleDelete = (id: string) => {
    const updated = todos.filter((item) => item.id !== id);
    saveTodos(updated);
  };

  const handleClearCompleted = () => {
    const updated = todos.filter((item) => !item.completed);
    saveTodos(updated);
  };

  return (
    <div className="flex flex-col h-full text-white font-sans text-xs">
      {/* Input form */}
      <form onSubmit={handleAdd} className="flex gap-1.5 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New task..."
          className="flex-1 px-2.5 py-1.5 bg-white/10 dark:bg-black/20 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/50"
        />
        <button
          type="submit"
          className="px-3 bg-amber-400 text-slate-900 font-semibold rounded-lg hover:bg-amber-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* List items */}
      <div className="flex-1 overflow-auto space-y-1.5 max-h-[160px] pr-1">
        {todos.length === 0 ? (
          <div className="text-center text-white/40 py-6 italic text-[11px]">
            No pending tasks. Add some!
          </div>
        ) : (
          todos.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className="flex items-center justify-between p-2 rounded-lg bg-white/5 dark:bg-black/15 border border-white/5 hover:bg-white/10 dark:hover:bg-black/20 transition-all cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 max-w-[85%]">
                {item.completed ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-white/40 shrink-0" />
                )}
                <span className={`truncate text-[11px] ${item.completed ? 'line-through text-white/40' : 'text-white/95'}`}>
                  {item.text}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                className="p-1 rounded text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer statistics */}
      {todos.some((i) => i.completed) && (
        <button
          onClick={handleClearCompleted}
          className="mt-2 text-[10px] text-amber-300/80 hover:text-amber-300 font-semibold underline text-right transition-colors"
        >
          Clear Finished Tasks
        </button>
      )}
    </div>
  );
}
