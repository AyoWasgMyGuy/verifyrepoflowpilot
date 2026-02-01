import React, { useMemo, useState } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrainDumpContext } from '../lib/brainDump';
import { FocusProvider, ProfileProvider, TasksProvider } from '../lib/hooks';
import { ToastProvider } from '../lib/toast';
import { TabsNavigator } from '../navigation/TabsNavigator';
import { TabsParamList } from '../navigation/types';
import { BrainDumpModal } from '../screens/BrainDumpModal';
import { ReviewModal } from '../screens/ReviewModal';

export function TestApp() {
  const navigationRef = useNavigationContainerRef<TabsParamList>();
  const [brainDumpOpen, setBrainDumpOpen] = useState(false);
  const [reviewItems, setReviewItems] = useState<string[] | null>(null);

  const brainDumpNavigation = useMemo(
    () => ({
      goBack: () => setBrainDumpOpen(false),
      navigate: (name: string, params?: { items?: string[] }) => {
        if (name === 'Review') {
          setBrainDumpOpen(false);
          setReviewItems(params?.items ?? []);
        }
      },
    }),
    []
  );

  const reviewNavigation = useMemo(
    () => ({
      goBack: () => setReviewItems(null),
      navigate: (name: string) => {
        setReviewItems(null);
        if (name === 'Tabs' || name === 'Inbox') {
          navigationRef.navigate('Inbox');
        }
      },
    }),
    [navigationRef]
  );

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <TasksProvider>
          <FocusProvider>
            <ToastProvider>
              <BrainDumpContext.Provider value={{ openBrainDump: () => setBrainDumpOpen(true) }}>
                <NavigationContainer ref={navigationRef}>
                  <TabsNavigator />
                </NavigationContainer>
                {brainDumpOpen ? (
                  <BrainDumpModal
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    navigation={brainDumpNavigation as any}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    route={{ key: 'BrainDump', name: 'BrainDump' } as any}
                  />
                ) : null}
                {reviewItems ? (
                  <ReviewModal
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    navigation={reviewNavigation as any}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    route={{ key: 'Review', name: 'Review', params: { items: reviewItems } } as any}
                  />
                ) : null}
              </BrainDumpContext.Provider>
            </ToastProvider>
          </FocusProvider>
        </TasksProvider>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
