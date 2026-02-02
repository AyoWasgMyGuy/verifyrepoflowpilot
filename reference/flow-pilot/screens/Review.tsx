import React, { useState } from 'react';
import { Task, TaskPriority } from '../types';

interface Props {
   parsedTasks: Partial<Task>[];
   onSave: (tasks: Task[]) => void;
   onBack: () => void;
}

const Review: React.FC<Props> = ({ parsedTasks, onSave, onBack }) => {
   // Convert partials to full tasks with temp IDs
   const [tasks, setTasks] = useState<Task[]>(
      parsedTasks.map((pt, idx) => ({
         ...pt,
         id: `temp-${Date.now()}-${idx}`,
         status: 'todo',
         createdAt: Date.now(),
         title: pt.title || 'Untitled Task',
         priority: pt.priority || TaskPriority.MEDIUM,
         category: pt.category || 'Work', // Fallback type string match
         durationMinutes: pt.durationMinutes || 30
      } as Task))
   );

   const handleRemove = (id: string) => {
      setTasks(tasks.filter(t => t.id !== id));
   };

   const handleSave = () => {
      onSave(tasks.map(t => ({ ...t, id: Date.now().toString() + Math.random() })));
   };

   return (
      <div className="h-screen w-full bg-background-dark flex flex-col">
         <header className="px-4 py-4 flex items-center justify-between border-b border-white/5 bg-background-dark z-20 sticky top-0">
            <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-white/5">
               <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="font-bold text-lg">Review Tasks</h2>
            <div className="size-10"></div>
         </header>

         <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
            {/* AI Insight Card */}
            <div className="w-full bg-surface-dark rounded-xl overflow-hidden border border-white/5 shadow-lg">
               <div className="h-24 bg-gradient-to-r from-teal-800 to-emerald-900 relative p-4 flex items-end">
                  <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">auto_awesome</span>
                     <span className="text-sm font-bold uppercase tracking-wider text-white">AI Insight</span>
                  </div>
               </div>
               <div className="p-4">
                  <p className="font-bold mb-1">Merge Suggestion</p>
                  <p className="text-sm text-text-secondary mb-3">
                     Seems like your tasks are focused on Work. Added tags automatically.
                  </p>
                  <button className="w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold border border-primary/20 hover:bg-primary/20">
                     Apply Suggestion
                  </button>
               </div>
            </div>

            <div>
               <div className="flex justify-between items-center mb-2 px-1">
                  <h3 className="font-bold text-lg">Detected Tasks</h3>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded">{tasks.length} tasks</span>
               </div>

               <div className="space-y-3">
                  {tasks.map(task => (
                     <div key={task.id} className="bg-surface-dark p-4 rounded-xl border border-white/5 flex flex-col gap-3 group">
                        <div className="flex items-start gap-3">
                           <span className="material-symbols-outlined text-text-secondary mt-1 cursor-grab">drag_indicator</span>
                           <input
                              value={task.title}
                              onChange={(e) => {
                                 const newTasks = [...tasks];
                                 newTasks.find(t => t.id === task.id)!.title = e.target.value;
                                 setTasks(newTasks);
                              }}
                              className="bg-transparent border-none p-0 text-lg font-medium text-white focus:ring-0 w-full"
                           />
                           <button onClick={() => handleRemove(task.id)} className="text-text-secondary hover:text-red-400">
                              <span className="material-symbols-outlined">delete</span>
                           </button>
                        </div>

                        <div className="pl-9 flex justify-between items-center">
                           <div className="flex items-center gap-1 bg-[#111818] p-1 rounded-full">
                              {[TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH].map((p, idx) => (
                                 <button
                                    key={p}
                                    onClick={() => {
                                       const newTasks = [...tasks];
                                       newTasks.find(t => t.id === task.id)!.priority = p;
                                       setTasks(newTasks);
                                    }}
                                    className={`size-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${task.priority === p ? 'bg-primary text-black' : 'text-slate-500 hover:bg-white/5'}`}
                                 >
                                    {idx + 1}
                                 </button>
                              ))}
                           </div>
                           <div className="flex items-center gap-1 bg-[#111818] px-3 py-1.5 rounded-lg border border-transparent focus-within:border-primary/50">
                              <span className="material-symbols-outlined text-sm text-text-secondary">schedule</span>
                              <input
                                 value={task.durationMinutes + 'm'}
                                 readOnly
                                 className="bg-transparent border-none p-0 w-10 text-right text-sm font-medium text-white focus:ring-0"
                              />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="absolute bottom-0 w-full p-6 pt-12 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-20">
            <button
               onClick={handleSave}
               className="w-full h-14 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(19,236,236,0.3)] hover:scale-[1.02] transition-transform"
            >
               <span>Save {tasks.length} Tasks to Inbox</span>
               <span className="material-symbols-outlined">arrow_forward</span>
            </button>
         </div>
      </div>
   );
};

export default Review;
