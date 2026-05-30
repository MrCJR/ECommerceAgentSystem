import { mockDelay } from './client';
import { tasks } from './mockData';
import type { Task } from '../types/domain';

export const tasksApi = {
  list: () => mockDelay([...tasks]),
  get: (taskId: string) => mockDelay(tasks.find((task) => task.id === taskId)),
  create: (input: Pick<Task, 'storeId' | 'agentType' | 'goal'>) => {
    const task: Task = {
      id: `task_${String(tasks.length + 1).padStart(3, '0')}`,
      title: input.goal.slice(0, 58),
      storeId: input.storeId,
      agentType: input.agentType,
      goal: input.goal,
      status: 'queued',
      riskLevel: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: `evt_${Date.now()}`,
          type: 'run_started',
          title: 'Task queued',
          summary: 'ArkOps created a task payload for the runtime adapter.',
          at: new Date().toISOString()
        }
      ]
    };
    tasks.unshift(task);
    return mockDelay(task);
  }
};
