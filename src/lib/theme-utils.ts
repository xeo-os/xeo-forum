export function getThemeFromCookie(cookieHeader: string): string {
    const themeCookie = cookieHeader.split(';').find((c) => c.trim().startsWith('theme='));

    if (!themeCookie) return 'dark';

    const themeValue = themeCookie.split('=')[1].trim().replace(/['"]/g, '');

    return themeValue === 'light' ? 'light' : 'dark';
}

export function getHtmlClassName(theme: string): string {
    return theme === 'light' ? '' : 'dark';
}
