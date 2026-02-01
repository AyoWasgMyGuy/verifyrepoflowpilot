import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_BASE_HEIGHT = 60;
export const FAB_GAP = 12;

export function useFloatingBottomOffset(extraGap = 0) {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR_BASE_HEIGHT + FAB_GAP + extraGap;
}
