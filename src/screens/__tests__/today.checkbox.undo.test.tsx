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
  };
});

jest.mock('../../lib/layout', () => ({
  useFloatingBottomOffset: () => 0,
}));

jest.mock('../../lib/brainDump', () => ({
  useBrainDump: () => ({ openBrainDump: jest.fn() }),
}));

describe('Today checkbox undo', () => {
  it('marks done and restores via undo snapshot', () => {
    const setStatus = jest.fn();
    const updateTask = jest.fn();
    const showToast = jest.fn();

    jest.spyOn(hooks, 'useTasks').mockReturnValue({
      tasks: [
        {
          id: 'task-1',
          title: 'Today task',
          status: 'today',
          priority: 2,
          estimateMinutes: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      setStatus,
      updateTask,
    } as ReturnType<typeof hooks.useTasks>);

    jest.spyOn(hooks, 'useProfile').mockReturnValue({
      profile: { displayName: 'Test', workStart: '09:00', workEnd: '17:00', focusMinutesDefault: 25 },
    } as ReturnType<typeof hooks.useProfile>);

    jest.spyOn(toast, 'useToast').mockReturnValue({ showToast } as ReturnType<typeof toast.useToast>);

    const navigation = { navigate: jest.fn() };
    const route = { key: 'Today', name: 'Today' };

    const { getByTestId } = render(
      <TodayScreen navigation={navigation as never} route={route as never} />
    );

    fireEvent.press(getByTestId('task-toggle-task-1'));

    expect(setStatus).toHaveBeenCalledWith('task-1', 'done');
    expect(showToast).toHaveBeenCalled();

    const toastArgs = showToast.mock.calls[0][0];
    toastArgs.onAction();

    expect(updateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'task-1',
        status: 'today',
        completedAt: undefined,
        completedFrom: undefined,
      })
    );
  });
});
