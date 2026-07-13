import type { useQueryClient } from '@tanstack/react-query';
import type { AgentConfig } from '../../../types/domain';

export type AgentWithStrategyConfig = AgentConfig & { strategyConfig: NonNullable<AgentConfig['strategyConfig']> };

/**
 * Shared utility for safely updating a strategyConfig sub-section via React Query cache.
 * Extracted from 4 duplicated definitions across strategy-config components.
 */
export function updateConfigSection(
  queryClient: ReturnType<typeof useQueryClient>,
  agent: AgentWithStrategyConfig,
  sectionKey: string,
  updater: (section: any) => any,
) {
  queryClient.setQueryData(['agent', agent.agentType], (prev: any) => {
    if (!prev?.strategyConfig) return prev;
    return {
      ...prev,
      strategyConfig: {
        ...prev.strategyConfig,
        [sectionKey]: updater(prev.strategyConfig[sectionKey]),
      },
    };
  });
}
