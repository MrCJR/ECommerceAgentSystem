import { mockDelay } from './client';
import { agentConfigs, agentRunStatsMap } from './agentMockData';
import { stores, tasks } from './mockData';
import type { AgentConfig, AgentType, Task, TaskStatus } from '../types/domain';

export const agentsApi = {
  list: (): Promise<AgentConfig[]> => mockDelay([...agentConfigs]),
  get: (agentType: AgentType): Promise<AgentConfig | undefined> =>
    mockDelay(agentConfigs.find((a) => a.agentType === agentType)),
  getStats: (agentType: AgentType) =>
    mockDelay(agentRunStatsMap[agentType]),
  getTasks: (agentType: AgentType): Promise<Task[]> =>
    mockDelay(tasks.filter((t) => t.agentType === agentType)),
  createTask: (agentType: AgentType, input: { title: string; goal: string; storeId: string; images?: string[] }): Promise<Task> => {
    const newId = `task_${String(tasks.length + 1).padStart(3, '0')}`;
    const task: Task = {
      id: newId,
      title: input.title,
      storeId: input.storeId,
      agentType,
      goal: input.goal,
      status: 'draft' as TaskStatus,
      riskLevel: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: input.images ? input.images.map((name, i) => ({
        id: `evt_${newId}_img${i}`,
        type: 'step_completed' as const,
        title: `上传图片 ${i + 1}`,
        summary: name,
        at: new Date().toISOString()
      })) : []
    };
    tasks.unshift(task);
    return mockDelay(task);
  },
  toggle: (agentType: AgentType): Promise<AgentConfig | undefined> => {
    const agent = agentConfigs.find((a) => a.agentType === agentType);
    if (agent) {
      agent.enabled = !agent.enabled;
    }
    return mockDelay(agent);
  }
};
