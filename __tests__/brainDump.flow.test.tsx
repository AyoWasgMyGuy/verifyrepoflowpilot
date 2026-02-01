import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TestApp } from '../src/test/TestApp';

describe('brain dump flow', () => {
  it('creates tasks and shows them in inbox', async () => {
    const { getByTestId, findByTestId, findByText } = render(<TestApp />);

    fireEvent.press(getByTestId('open-brain-dump'));
    expect(await findByTestId('brain-dump-modal')).toBeTruthy();

    const input = getByTestId('brain-dump-input');
    fireEvent.changeText(input, 'Test task');

    fireEvent.press(getByTestId('brain-dump-submit'));
    expect(await findByTestId('review-modal')).toBeTruthy();

    fireEvent.press(getByTestId('add-all-tasks'));

    fireEvent.press(getByTestId('tab-inbox'));
    expect(await findByTestId('inbox-list')).toBeTruthy();
    expect(await findByText('Test task')).toBeTruthy();

    await waitFor(() => expect(getByTestId('screen-inbox')).toBeTruthy());
  });
});
