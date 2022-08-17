import { BusinessUtils } from '../../src/business/BusinessUtils';

test('Tests for BusinessUtils.formatAvatarTitle', () => {
    // Assert
    expect(BusinessUtils.formatAvatarTitle('Garry Xiao')).toBe('GX');
    expect(BusinessUtils.formatAvatarTitle('Etsoo')).toBe('ME');
    expect(BusinessUtils.formatAvatarTitle('Etsoo', 3, 'E')).toBe('E');
    expect(BusinessUtils.formatAvatarTitle('Etsoo', 5)).toBe('ETSOO');
});
