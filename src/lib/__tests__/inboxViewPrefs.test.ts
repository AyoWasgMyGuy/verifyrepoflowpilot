import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadInboxViewPrefs, saveInboxViewPrefs, INBOX_VIEW_PREFS_KEY } from '../inboxViewPrefs';

describe('inbox view prefs', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns defaults when empty', async () => {
    const prefs = await loadInboxViewPrefs();
    expect(prefs.sortMode).toBe('priority');
    expect(prefs.category).toBe('all');
  });

  it('saves and loads prefs', async () => {
    await saveInboxViewPrefs({ sortMode: 'due', category: 'personal' });
    const stored = await AsyncStorage.getItem(INBOX_VIEW_PREFS_KEY);
    expect(stored).toContain('due');
    const prefs = await loadInboxViewPrefs();
    expect(prefs.sortMode).toBe('due');
    expect(prefs.category).toBe('personal');
  });
});
