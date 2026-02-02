import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearReviewDraft, loadReviewDraft, REVIEW_DRAFT_KEY, saveReviewDraft } from '../reviewDraft';

describe('reviewDraft storage helpers', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('saves and loads drafts with savedAt', async () => {
    const payload = await saveReviewDraft([
      { key: '0', title: 'Draft task', priority: 2, estimateMinutes: 30, dueAt: null },
    ]);

    expect(payload?.savedAt).toBeGreaterThan(0);

    const loaded = await loadReviewDraft();
    expect(loaded?.drafts[0].title).toBe('Draft task');
    expect(loaded?.savedAt).toBeGreaterThan(0);
  });

  it('updates savedAt on subsequent saves', async () => {
    const nowSpy = jest.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(2000);

    await saveReviewDraft([{ key: '0', title: 'First', priority: 2, estimateMinutes: 30, dueAt: null }]);
    const first = await loadReviewDraft();
    expect(first?.savedAt).toBe(1000);

    await saveReviewDraft([{ key: '0', title: 'Second', priority: 2, estimateMinutes: 30, dueAt: null }]);
    const second = await loadReviewDraft();
    expect(second?.savedAt).toBe(2000);
  });

  it('clears stored draft', async () => {
    await saveReviewDraft([{ key: '0', title: 'Draft', priority: 2, estimateMinutes: 30, dueAt: null }]);
    await clearReviewDraft();
    expect(await AsyncStorage.getItem(REVIEW_DRAFT_KEY)).toBeNull();
  });
});
