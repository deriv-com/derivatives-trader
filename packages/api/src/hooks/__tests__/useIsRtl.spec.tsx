import { renderHook } from '@testing-library/react-hooks';
import useIsRtl from '../useIsRtl';
import { useTranslations } from '@deriv-com/translations';

jest.mock('@deriv-com/translations', () => ({
    ...jest.requireActual('@deriv-com/translations'),
    useTranslations: jest.fn(),
}));

const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;

describe('useIsRtl', () => {
    it('should return false when language is not RTL', () => {
        mockUseTranslations.mockReturnValue({
            currentLang: 'EN',
            localize: jest.fn(),
            ready: true,
            instance: {} as any,
            switchLanguage: jest.fn(),
        });
        const { result } = renderHook(() => useIsRtl());

        expect(result.current).toBe(false);
    });

    it('should return true when language is RTL', () => {
        mockUseTranslations.mockReturnValue({
            currentLang: 'AR',
            localize: jest.fn(),
            ready: true,
            instance: {} as any,
            switchLanguage: jest.fn(),
        });
        const { result } = renderHook(() => useIsRtl());

        expect(result.current).toBe(true);
    });
});
