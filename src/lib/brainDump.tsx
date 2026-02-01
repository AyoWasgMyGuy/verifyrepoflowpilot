import React, { createContext, useContext } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type BrainDumpContextValue = {
  openBrainDump: () => void;
};

export const BrainDumpContext = createContext<BrainDumpContextValue | undefined>(undefined);

export function BrainDumpProvider({ children }: { children: React.ReactNode }) {
  const existing = useContext(BrainDumpContext);
  if (existing) {
    return <>{children}</>;
  }

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const openBrainDump = () => {
    const parent = navigation.getParent?.();
    const target = (parent ?? navigation) as NavigationProp<RootStackParamList>;
    target.navigate('BrainDump');
  };

  return (
    <BrainDumpContext.Provider value={{ openBrainDump }}>
      {children}
    </BrainDumpContext.Provider>
  );
}

export function useBrainDump() {
  const ctx = useContext(BrainDumpContext);
  if (!ctx) {
    throw new Error('useBrainDump must be used within BrainDumpProvider');
  }
  return ctx;
}
