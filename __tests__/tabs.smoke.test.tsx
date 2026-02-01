import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TestApp } from '../src/test/TestApp';

describe('tabs smoke', () => {
  it('navigates across all tabs', async () => {
    const { getByTestId, findByTestId } = render(<TestApp />);

    expect(getByTestId('screen-today')).toBeTruthy();

    fireEvent.press(getByTestId('tab-inbox'));
    expect(await findByTestId('screen-inbox')).toBeTruthy();

    fireEvent.press(getByTestId('tab-plan'));
    expect(await findByTestId('screen-plan')).toBeTruthy();

    fireEvent.press(getByTestId('tab-focus'));
    expect(await findByTestId('screen-focus')).toBeTruthy();

    fireEvent.press(getByTestId('tab-settings'));
    expect(await findByTestId('screen-settings')).toBeTruthy();

    fireEvent.press(getByTestId('tab-today'));
    await waitFor(() => expect(getByTestId('screen-today')).toBeTruthy());
  });
});
