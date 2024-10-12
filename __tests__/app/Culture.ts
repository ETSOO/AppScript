import { zhHans } from '../../src';

test('Tests for zhHans', async () => {
    const zh = zhHans(
        { nameB: '名称覆盖' },
        new Promise((resolve) => resolve({ no: 'No override' }))
    );
    const resources =
        typeof zh.resources === 'object' ? zh.resources : await zh.resources();

    expect(resources.name).toBe('姓名');
    expect(resources.nameB).toBe('名称覆盖');
    expect(resources.no).toBe('No override');
});
