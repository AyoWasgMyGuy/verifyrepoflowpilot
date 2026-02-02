import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { ReviewModal } from '../ReviewModal';
import * as hooks from '../../lib/hooks';
import * as toast from '../../lib/toast';

const STORAGE_KEY = 'flowpilot.reviewDraft.v1';

describe('ReviewModal draft persistence', () => {
  const addTasks = jest.fn(async () => undefined);
  const updateTask = jest.fn();
  const setStatus = jest.fn();
  const deleteTask = jest.fn();
  const addSubtask = jest.fn();
  const toggleSubtask = jest.fn();
  const resetTasks = jest.fn();
  const refresh = jest.fn();
  const showToast = jest.fn();
  const hideToast = jest.fn();

  beforeEach(async () => {
    addTasks.mockClear();
    updateTask.mockClear();
    setStatus.mockClear();
    deleteTask.mockClear();
    addSubtask.mockClear();
    toggleSubtask.mockClear();
    resetTasks.mockClear();
    refresh.mockClear();
    showToast.mockClear();
    hideToast.mockClear();
    await AsyncStorage.clear();
    jest.spyOn(hooks, 'useTasks').mockReturnValue({
      tasks: [],
      isLoading: false,
      addTasks,
      updateTask,
      setStatus,
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
    jest.clearAllTimers();
  });

  it('shows resume prompt and resumes stored drafts', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        drafts: [{ key: '0', title: 'Stored Task', priority: 2, estimateMinutes: 30, dueAt: null }],
        savedAt: Date.now(),
      })
    );

    const navigation = { goBack: jest.fn(), navigate: jest.fn() };
    const route = { key: 'Review', name: 'Review', params: { items: ['Route Task'] } };

    const { findByText, findByDisplayValue, getByTestId } = render(
      <ReviewModal navigation={navigation as never} route={route as never} />
    );

    expect(await findByText('Resume draft?')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('review-resume'));
    });

    expect(await findByDisplayValue('Stored Task')).toBeTruthy();
  });

  it('start new clears stored draft and uses route items', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        drafts: [{ key: '0', title: 'Stored Task', priority: 2, estimateMinutes: 30, dueAt: null }],
        savedAt: Date.now(),
      })
    );

    const navigation = { goBack: jest.fn(), navigate: jest.fn() };
    const route = { key: 'Review', name: 'Review', params: { items: ['Route Task'] } };

    const { findByText, findByDisplayValue, getByTestId } = render(
      <ReviewModal navigation={navigation as never} route={route as never} />
    );

    expect(await findByText('Resume draft?')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('review-start-new'));
    });

    expect(await findByDisplayValue('Route Task')).toBeTruthy();
    expect(await AsyncStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('edits trigger draft persistence', async () => {
    jest.useFakeTimers();
    const getItemSpy = jest.spyOn(AsyncStorage, 'getItem');
    const navigation = { goBack: jest.fn(), navigate: jest.fn() };
    const route = { key: 'Review', name: 'Review', params: { items: ['Initial Task'] } };

    const { getByDisplayValue } = render(
      <ReviewModal navigation={navigation as never} route={route as never} />
    );

    await waitFor(() => expect(getItemSpy).toHaveBeenCalled());

    fireEvent.changeText(getByDisplayValue('Initial Task'), 'Updated Task');

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    expect(stored).toContain('Updated Task');
  });

  it('persists category changes in autosave', async () => {
    jest.useFakeTimers();
    const navigation = { goBack: jest.fn(), navigate: jest.fn() };
    const route = { key: 'Review', name: 'Review', params: { items: ['Initial Task'] } };

    const { getByTestId } = render(
      <ReviewModal navigation={navigation as never} route={route as never} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.press(getByTestId('review-category-0-work'));

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    expect(stored).toContain('\"category\":\"work\"');
  });

  it('discard draft clears storage and exits to today', async () => {
    jest.useFakeTimers();
    const removeSpy = jest.spyOn(AsyncStorage, 'removeItem');
    const dispatch = jest.fn();
    const navigation = { goBack: jest.fn(), navigate: jest.fn(), dispatch };
    const route = { key: 'Review', name: 'Review', params: { items: ['Route Task'] } };

    const { findByDisplayValue, getByTestId, queryByText } = render(
      <ReviewModal navigation={navigation as never} route={route as never} />
    );

    const input = await findByDisplayValue('Route Task');
    fireEvent.changeText(input, 'Edited Task');

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    await act(async () => {
      fireEvent.press(getByTestId('review-menu-button'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('review-discard'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('review-discard-confirm'));
    });

    expect(removeSpy).toHaveBeenCalledWith(STORAGE_KEY);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RESET',
        payload: expect.objectContaining({
          routes: [expect.objectContaining({ name: 'Tabs' })],
        }),
      })
    );
    expect(queryByText('No saved draft')).toBeNull();
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Draft discarded' }));
  });
});
