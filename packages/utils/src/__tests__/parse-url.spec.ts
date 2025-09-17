import { isExternalLink } from '../parse-url';

describe('isExternalLink', () => {
    it('should return true if the link matches the regex for external link', () => {
        expect(isExternalLink('https://www.deriv.com')).toBeTruthy();
        expect(isExternalLink('http://example.com')).toBeTruthy();
        expect(isExternalLink('mailto:test@example.com')).toBeTruthy();
    });

    it("should return false if the link doesn't match the regex for external link", () => {
        expect(isExternalLink('localhost:3000')).toBeFalsy();
        expect(isExternalLink('/internal/path')).toBeFalsy();
        expect(isExternalLink('relative-path')).toBeFalsy();
        expect(isExternalLink('sftp://test_doc.com')).toBeFalsy();
        expect(isExternalLink('ftp://example.com')).toBeFalsy();
    });
});
