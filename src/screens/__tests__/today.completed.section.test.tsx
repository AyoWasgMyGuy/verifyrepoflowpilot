import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { TodayScreen } from '../Today';
import * as hooks from '../../lib/hooks';
import * as toast from '../../lib/toast';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn() }),
    useFocusEffect: () => {},
  };
});

jest.mock('../../lib/layout', () => ({
  useFloatingBottomOffset: () => 0,
}));

jest.mock('../../lib/brainDump', () => ({
  useBrainDump: () => ({ openBrainDump: jest.fn() }),
}));

describe('Today completed section', () => {
  it('renders collapsed completed section and allows restore', () => {
    const setStatus = jest.fn();
    const updateTask = jest.fn();
    const showToast = jest.fn();
    const hideToast = jest.fn();

    jest.spyOn(hooks, 'useTasks').mockReturnValue({
      tasks: [
        {
          id: 'task-today',
          title: 'Today task',
          status: 'today',
          priority: 2,
          estimateMinutes: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-done',
          title: 'Done task',
          status: 'done',
          completedFrom: 'today',
          completedAt: new Date().toISOString(),
          priority: 2,
          estimateMinutes: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
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

    const navigation = { navigate: jest.fn() };
    const route = { key: 'Today', name: 'Today' };

    const { getByTestId, getByText, queryByText } = render(
      <TodayScreen navigation={navigation as never} route={route as never} />
    );

    expect(getByTestId('completed-header')).toBeTruthy();
    expect(queryByText('Done task')).toBeNull();

    fireEvent.press(getByTestId('completed-header'));
    expect(getByText('Done task')).toBeTruthy();

    fireEvent.press(getByTestId('completed-toggle-task-done'));

    expect(setStatus).toHaveBeenCalledWith('task-done', 'today');
  });
});
