import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { TodayScreen } from '../Today';
import * as hooks from '../../lib/hooks';
import * as toast from '../../lib/toast';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn() }),
    useFocusEffect: (callback: () => void) => {
      const React = require('react');
      React.useEffect(() => callback(), [callback]);
    },
  };
});

jest.mock('../../lib/layout', () => ({
  useFloatingBottomOffset: () => 0,
}));

jest.mock('../../lib/brainDump', () => ({
  useBrainDump: () => ({ openBrainDump: jest.fn() }),
}));

describe('Today draft banner', () => {
  const setStatus = jest.fn();
  const updateTask = jest.fn();
  const showToast = jest.fn();
  const hideToast = jest.fn();

  beforeEach(async () => {
    setStatus.mockClear();
    updateTask.mockClear();
    showToast.mockClear();
    hideToast.mockClear();
    await AsyncStorage.clear();

    jest.spyOn(hooks, 'useTasks').mockReturnValue({
      tasks: [],
      isLoading: false,
      setStatus,
      updateTask,
      addTasks: jest.fn(),
      deleteTask: jest.fn(),
      addSubtask: jest.fn(),
      toggleSubtask: jest.fn(),
      resetTasks: jest.fn(),
      refresh: jest.fn(),
    } as ReturnType<typeof hooks.useTasks>);

    jest.spyOn(hooks, 'useProfile').mockReturnValue({
      profile: { displayName: 'Test', workStart: '09:00', workEnd: '17:00', focusMinutesDefault: 25 },
    } as ReturnType<typeof hooks.useProfile>);

    jest.spyOn(toast, 'useToast').mockReturnValue({ showToast, hideToast } as ReturnType<typeof toast.useToast>);
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('shows banner when a draft exists and allows discard', async () => {
    await AsyncStorage.setItem(
      'flowpilot.reviewDraft.v1',
      JSON.stringify({
        version: 1,
        drafts: [{ key: '0', title: 'Draft task', priority: 2, estimateMinutes: 30, dueAt: null }],
        savedAt: Date.now(),
      })
    );

    const navigation = { navigate: jest.fn() };
    const route = { key: 'Today', name: 'Today' };

    const { getByTestId, queryByTestId } = render(
      <TodayScreen navigation={navigation as never} route={route as never} />
    );

    await waitFor(() => expect(getByTestId('draft-banner')).toBeTruthy());

    fireEvent.press(getByTestId('draft-discard'));
    await act(async () => {
      fireEvent.press(getByTestId('draft-discard-confirm'));
    });

    await waitFor(() => expect(queryByTestId('draft-banner')).toBeNull());
    expect(await AsyncStorage.getItem('flowpilot.reviewDraft.v1')).toBeNull();
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Draft discarded' }));
  });
});
