import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { InboxScreen } from '../Inbox';
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

describe('Inbox Phase 2.5 controls', () => {
  const setStatus = jest.fn();
  const updateTask = jest.fn();
  const addTasks = jest.fn();
  const deleteTask = jest.fn();
  const addSubtask = jest.fn();
  const toggleSubtask = jest.fn();
  const resetTasks = jest.fn();
  const refresh = jest.fn();
  const showToast = jest.fn();
  const hideToast = jest.fn();

  beforeEach(() => {
    setStatus.mockClear();
    updateTask.mockClear();
    addTasks.mockClear();
    deleteTask.mockClear();
    addSubtask.mockClear();
    toggleSubtask.mockClear();
    resetTasks.mockClear();
    refresh.mockClear();
    showToast.mockClear();
    hideToast.mockClear();

    jest.spyOn(hooks, 'useTasks').mockReturnValue({
      tasks: [
        {
          id: 't1',
          title: 'Alpha Task',
          notes: 'meeting',
          status: 'inbox',
          priority: 3,
          estimateMinutes: 30,
          category: 'work',
          dueAt: '2026-02-05',
          createdAt: '2026-02-01T08:00:00Z',
          updatedAt: '2026-02-01T08:00:00Z',
        },
        {
          id: 't2',
          title: 'Beta Task',
          notes: 'personal errand',
          status: 'inbox',
          priority: 1,
          estimateMinutes: 30,
          category: 'personal',
          dueAt: null,
          createdAt: '2026-02-03T10:00:00Z',
          updatedAt: '2026-02-03T10:00:00Z',
        },
        {
          id: 't3',
          title: 'Gamma Task',
          notes: 'study',
          status: 'inbox',
          priority: 2,
          estimateMinutes: 30,
          category: 'learning',
          dueAt: '2026-02-03',
          createdAt: '2026-02-02T09:00:00Z',
          updatedAt: '2026-02-02T09:00:00Z',
        },
        {
          id: 't4',
          title: 'Other Task',
          notes: '',
          status: 'inbox',
          priority: 2,
          estimateMinutes: 30,
          category: undefined,
          dueAt: null,
          createdAt: '2026-01-30T09:00:00Z',
          updatedAt: '2026-01-30T09:00:00Z',
        },
      ],
      isLoading: false,
      setStatus,
      updateTask,
      addTasks,
      deleteTask,
      addSubtask,
      toggleSubtask,
      resetTasks,
      refresh,
    } as ReturnType<typeof hooks.useTasks>);

    jest.spyOn(toast, 'useToast').mockReturnValue({ showToast, hideToast } as ReturnType<typeof toast.useToast>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders search, chips, and sort controls', async () => {
    const navigation = { navigate: jest.fn() };
    const route = { key: 'Inbox', name: 'Inbox' };
    const { getByTestId } = render(<InboxScreen navigation={navigation as never} route={route as never} />);

    await waitFor(() => {
      expect(getByTestId('inbox-search-input')).toBeTruthy();
    });

    expect(getByTestId('chip-all')).toBeTruthy();
    expect(getByTestId('chip-work')).toBeTruthy();
    expect(getByTestId('chip-personal')).toBeTruthy();
    expect(getByTestId('chip-learning')).toBeTruthy();
    expect(getByTestId('sort-priority')).toBeTruthy();
    expect(getByTestId('sort-due')).toBeTruthy();
    expect(getByTestId('sort-newest')).toBeTruthy();
  });

  it('filters by search and category and sorts by due date', async () => {
    const navigation = { navigate: jest.fn() };
    const route = { key: 'Inbox', name: 'Inbox' };
    const { getByTestId, getAllByTestId, queryByText } = render(
      <InboxScreen navigation={navigation as never} route={route as never} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.changeText(getByTestId('inbox-search-input'), 'beta');
    expect(queryByText('Beta Task')).toBeTruthy();
    expect(queryByText('Alpha Task')).toBeNull();

    fireEvent.press(getByTestId('inbox-search-clear'));
    fireEvent.press(getByTestId('chip-work'));
    expect(queryByText('Alpha Task')).toBeTruthy();
    expect(queryByText('Beta Task')).toBeNull();

    fireEvent.press(getByTestId('chip-all'));
    fireEvent.press(getByTestId('sort-due'));

    const titles = getAllByTestId(/inbox-task-title-/).map((node) =>
      Array.isArray(node.props.children) ? node.props.children.join('') : node.props.children
    );

    expect(titles).toEqual(['Gamma Task', 'Alpha Task', 'Other Task', 'Beta Task']);
  });

  it('toggles controls panel with options button', async () => {
    const navigation = { navigate: jest.fn() };
    const route = { key: 'Inbox', name: 'Inbox' };
    const { getByTestId, queryByTestId } = render(
      <InboxScreen navigation={navigation as never} route={route as never} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(getByTestId('inbox-controls')).toBeTruthy();

    fireEvent.press(getByTestId('inbox-controls-toggle'));
    expect(queryByTestId('inbox-controls')).toBeNull();

    fireEvent.press(getByTestId('inbox-controls-toggle'));
    expect(getByTestId('inbox-controls')).toBeTruthy();
  });

  it('saves category from new task modal', async () => {
    addTasks.mockResolvedValueOnce(undefined);
    const navigation = { navigate: jest.fn() };
    const route = { key: 'Inbox', name: 'Inbox' };
    const { getByTestId, getByPlaceholderText, getByText } = render(
      <InboxScreen navigation={navigation as never} route={route as never} />
    );

    fireEvent.press(getByTestId('inbox-add-task'));
    fireEvent.changeText(getByPlaceholderText('Task title'), 'New category task');
    fireEvent.press(getByTestId('new-task-category-work'));

    await act(async () => {
      fireEvent.press(getByText('Add'));
    });

    expect(addTasks).toHaveBeenCalledWith([
      expect.objectContaining({
        title: 'New category task',
        category: 'work',
      }),
    ]);
  });
});
