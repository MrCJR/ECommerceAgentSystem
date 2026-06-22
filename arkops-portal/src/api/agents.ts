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
      // 开启时检查依赖是否已全部开通
      if (!agent.enabled) {
        const missing = agent.dependsOn.filter(
          (dep) => !agentConfigs.find((a) => a.agentType === dep)?.enabled
        );
        if (missing.length > 0) {
          throw new Error(`依赖未满足: ${missing.join(', ')}`);
        }
      }
      agent.enabled = !agent.enabled;
    }
    return mockDelay(agent);
  },
  regenerateSeoKeywords: (agentType: AgentType): Promise<string[]> => {
    const agent = agentConfigs.find((a) => a.agentType === agentType);
    const pool = [
      'wireless earbuds', 'bluetooth 5.3', 'noise cancelling', 'long battery life',
      'IPX5 waterproof', 'ergonomic design', 'fast charging', 'premium audio',
      'gaming headset', 'sports earphones', 'ANC technology', 'dual driver',
      'ultra-lightweight', 'voice assistant', 'touch control', 'USB-C charging'
    ];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const keywords = shuffled.slice(0, 6 + Math.floor(Math.random() * 4));
    if (agent?.strategyConfig?.seoKeywords) {
      agent.strategyConfig.seoKeywords.keywords = keywords;
      agent.strategyConfig.seoKeywords.lastGenerated = new Date().toISOString();
    }
    return mockDelay(keywords);
  },
  regenerateAudience: (agentType: AgentType): Promise<string[]> => {
    const agent = agentConfigs.find((a) => a.agentType === agentType);
    const pool = [
      '18-35岁', '科技爱好者', '运动健身人群', '通勤白领', '学生群体',
      '音乐发烧友', '数码极客', '户外旅行者', '潮流青年', '商务人士',
      '游戏玩家', '居家办公族', '宝妈人群', '银发一族', '跨境买家'
    ];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const tags = shuffled.slice(0, 4 + Math.floor(Math.random() * 4));
    if (agent?.strategyConfig?.targetAudience) {
      agent.strategyConfig.targetAudience.tags = tags;
      agent.strategyConfig.targetAudience.lastGenerated = new Date().toISOString();
    }
    return mockDelay(tags);
  },
  saveStrategyConfig: (agentType: AgentType, config: { costMultiplier?: number; dailyCap?: number }): Promise<AgentConfig | undefined> => {
    const agent = agentConfigs.find((a) => a.agentType === agentType);
    if (agent?.strategyConfig) {
      const sc = agent.strategyConfig;
      if (sc.pricingRule && config.costMultiplier !== undefined) sc.pricingRule.costMultiplier = config.costMultiplier;
      if (sc.adSpendBudget && config.dailyCap !== undefined) sc.adSpendBudget.dailyCap = config.dailyCap;
    }
    return mockDelay(agent);
  },
  cancelTask: (taskId: string): Promise<Task | undefined> => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = 'cancelled';
      task.updatedAt = new Date().toISOString();
      task.timeline.push({
        id: `evt_cancel_${Date.now()}`,
        type: 'run_failed',
        title: '任务已取消',
        summary: '由用户手动取消',
        at: new Date().toISOString()
      });
    }
    return mockDelay(task);
  }
};
