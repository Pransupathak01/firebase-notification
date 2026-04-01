import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../../locales/en.json';
import hi from '../../locales/hi.json';

const LANGUAGE_KEY = 'APP_LANG';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
};


const getDeviceLanguage = () => {
    const locales = RNLocalize.getLocales();
    return locales[0]?.languageCode || 'en';

};

const initI18n = async () => {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    const initialLanguage = storedLanguage || getDeviceLanguage();

    i18n
        .use(initReactI18next)


        .init({
            compatibilityJSON: 'v4',
            resources,
            lng: initialLanguage,
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false,
            },
            react: {
                useSuspense: false,
            }
        });
};

initI18n();

export const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    i18n.changeLanguage(lang);
};

export default i18n;
