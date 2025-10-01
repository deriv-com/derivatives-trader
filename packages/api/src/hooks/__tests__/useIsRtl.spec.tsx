import { renderHook } from '@testing-library/react-hooks';
import useIsRtl from '../useIsRtl';
import { useTranslations } from '@deriv-com/translations';

jest.mock('@deriv-com/translations', () => ({
    ...jest.requireActual('@deriv-com/translations'),
    useTranslations: jest.fn(),
}));

const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;

describe('useIsRtl', () => {
    const createMockInstance = (dirResult: string) => ({
        dir: jest.fn().mockReturnValue(dirResult),
    });

    it('should return false when language is not RTL', () => {
        mockUseTranslations.mockReturnValue({
            currentLang: 'EN',
            localize: jest.fn(),
            ready: true,
            instance: createMockInstance('ltr') as any,
            switchLanguage: jest.fn(),
        });
        const { result } = renderHook(() => useIsRtl());

        expect(result.current).toBe(false);
    });

    it('should return true when language is Arabic (AR)', () => {
        mockUseTranslations.mockReturnValue({
            currentLang: 'AR',
            localize: jest.fn(),
            ready: true,
            instance: createMockInstance('rtl') as any,
            switchLanguage: jest.fn(),
        });
        const { result } = renderHook(() => useIsRtl());

        expect(result.current).toBe(true);
    });

    it('should return true when language is Hebrew (HE)', () => {
        mockUseTranslations.mockReturnValue({
            currentLang: 'HE',
            localize: jest.fn(),
            ready: true,
            instance: createMockInstance('rtl') as any,
            switchLanguage: jest.fn(),
        });
        const { result } = renderHook(() => useIsRtl());

        expect(result.current).toBe(true);
    });

    it('should return true when language is Persian (FA)', () => {
        mockUseTranslations.mockReturnValue({
            currentLang: 'FA',
            localize: jest.fn(),
            ready: true,
            instance: createMockInstance('rtl') as any,
            switchLanguage: jest.fn(),
        });
        const { result } = renderHook(() => useIsRtl());

        expect(result.current).toBe(true);
    });

    it('should return false when i18next instance is not available', () => {
        mockUseTranslations.mockReturnValue({
            currentLang: 'AR',
            localize: jest.fn(),
            ready: true,
            instance: null as any,
            switchLanguage: jest.fn(),
        });
        const { result } = renderHook(() => useIsRtl());

        expect(result.current).toBe(false);
    });

    it('should return false when i18next instance does not have dir method', () => {
        mockUseTranslations.mockReturnValue({
            currentLang: 'AR',
            localize: jest.fn(),
            ready: true,
            instance: {} as any,
            switchLanguage: jest.fn(),
        });
        const { result } = renderHook(() => useIsRtl());

        expect(result.current).toBe(false);
    });

    it('should call i18next dir method with lowercase language code', () => {
        const mockInstance = createMockInstance('rtl');
        mockUseTranslations.mockReturnValue({
            currentLang: 'AR',
            localize: jest.fn(),
            ready: true,
            instance: mockInstance as any,
            switchLanguage: jest.fn(),
        });

        renderHook(() => useIsRtl());

        expect(mockInstance.dir).toHaveBeenCalledWith('ar');
    });
});
