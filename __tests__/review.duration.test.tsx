import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ReviewModal } from '../src/screens/ReviewModal';
import * as hooks from '../src/lib/hooks';

describe('ReviewModal duration save', () => {
  const addTasks = jest.fn(async () => undefined);

  beforeEach(() => {
    addTasks.mockClear();
    jest.spyOn(hooks, 'useTasks').mockReturnValue({ addTasks } as ReturnType<typeof hooks.useTasks>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores estimateMinutes from hours and minutes', async () => {
    const navigation = { goBack: jest.fn(), navigate: jest.fn() };
    const route = { key: 'Review', name: 'Review', params: { items: ['Task 1'] } } as const;

    const { getByText, getByTestId, findByPlaceholderText } = render(
      <ReviewModal navigation={navigation as never} route={route as never} />
    );

    fireEvent.press(getByText('30m'));

    const hoursInput = await findByPlaceholderText('Hours');
    const minutesInput = await findByPlaceholderText('Minutes');

    fireEvent.changeText(hoursInput, '2');
    fireEvent.changeText(minutesInput, '15');

    fireEvent.press(getByText('Done'));
    fireEvent.press(getByTestId('add-all-tasks'));

    await waitFor(() => expect(addTasks).toHaveBeenCalled());
    const saved = addTasks.mock.calls[0][0];
    expect(saved[0].estimateMinutes).toBe(135);
  });
});
