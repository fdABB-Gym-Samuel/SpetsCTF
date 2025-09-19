import en from './en.json';
import sv from './sv.json';

export type Language = 'en' | 'sv';

export function getTranslations(header: string) {
    const preferredLanguage = header.split(',')[0].split('-')[0];

    if (preferredLanguage === 'sv') {
        return sv;
    } else {
        return en;
    }
}
