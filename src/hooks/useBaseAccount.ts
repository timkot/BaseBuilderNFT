import { useContext } from 'react';
import { BaseAccountContext } from '@/contexts/BaseAccountContext';

export function useBaseAccount() {
  const context = useContext(BaseAccountContext);

  if (!context) {
    throw new Error('useBaseAccount must be used within a BaseAccountProvider');
  }

  return context;
}
