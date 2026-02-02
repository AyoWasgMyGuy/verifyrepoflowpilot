import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { TaskDetailScreen } from '../TaskDetail';
import * as hooks from '../../lib/hooks';
import * as toast from '../../lib/toast';

describe('TaskDetail category editing', () => {
  it('updates category from the menu', () => {
    const setStatus = jest.fn();
    const updateTask = jest.fn();
    const deleteTask = jest.fn();
    const addSubtask = jest.fn();
    const toggleSubtask = jest.fn();
    const showToast = jest.fn();
    const hideToast = jest.fn();

    jest.spyOn(hooks, 'useTasks').mockReturnValue({
      tasks: [
        {
          id: 'task-1',
          title: 'Category task',
          status: 'inbox',
          priority: 2,
          estimateMinutes: 30,
          category: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
      setStatus,
      updateTask,
      addTasks: jest.fn(),
      deleteTask,
      addSubtask,
      toggleSubtask,
      resetTasks: jest.fn(),
      refresh: jest.fn(),
    } as ReturnType<typeof hooks.useTasks>);

    jest.spyOn(hooks, 'useFocus').mockReturnValue({
      session: { isRunning: false, remainingSeconds: 0, durationSeconds: 0 },
      startFocus: jest.fn(),
      pauseFocus: jest.fn(),
      resumeFocus: jest.fn(),
      updateRemaining: jest.fn(),
      endFocus: jest.fn(),
    } as ReturnType<typeof hooks.useFocus>);

    jest.spyOn(toast, 'useToast').mockReturnValue({ showToast, hideToast } as ReturnType<typeof toast.useToast>);

    const navigation = { goBack: jest.fn(), navigate: jest.fn() };
    const route = { key: 'TaskDetail', name: 'TaskDetail', params: { taskId: 'task-1' } };

    const { getByTestId, getByText } = render(
      <TaskDetailScreen navigation={navigation as never} route={route as never} />
    );

    expect(getByText('General')).toBeTruthy();

    fireEvent.press(getByTestId('taskdetail-category'));
    fireEvent.press(getByTestId('taskdetail-category-work'));

    expect(updateTask).toHaveBeenCalledWith(expect.objectContaining({ category: 'work' }));
    expect(getByText('Work')).toBeTruthy();
  });
});