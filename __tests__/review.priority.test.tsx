import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TestApp } from '../src/test/TestApp';

describe('review priority mapping', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('stores priority 2 and renders MED badge', async () => {
    const { getByTestId, findByTestId, findByText, getAllByText } = render(<TestApp />);

    fireEvent.press(getByTestId('open-brain-dump'));
    expect(await findByTestId('brain-dump-modal')).toBeTruthy();

    fireEvent.changeText(getByTestId('brain-dump-input'), 'Priority Two Task');
    fireEvent.press(getByTestId('brain-dump-submit'));

    expect(await findByTestId('review-modal')).toBeTruthy();

    fireEvent.press(getAllByText('MED')[0]);

    fireEvent.press(getByTestId('add-all-tasks'));

    fireEvent.press(getByTestId('tab-inbox'));
    expect(await findByTestId('inbox-list')).toBeTruthy();
    expect(await findByText('Priority Two Task')).toBeTruthy();
    expect(await findByText('MED')).toBeTruthy();

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem('flowpilot:tasks');
      const tasks = stored ? JSON.parse(stored) : [];
      const task = tasks.find((item: { title: string }) => item.title === 'Priority Two Task');
      expect(task?.priority).toBe(2);
    });
  });
});
