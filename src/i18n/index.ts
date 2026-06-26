// ============================================================
// i18n — 国际化模块
// 轻量方案：基于 Zustand，无外部依赖
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zh } from './locales/zh';
import { en } from './locales/en';
import { translateMessage } from './messageTranslator';

/** 支持的语言 */
export type Locale = 'zh' | 'en';

/** 翻译字典类型 */
export type Translations = Record<string, any>;

/** 语言包映射 */
const localeMap: Record<Locale, Translations> = { zh, en };

/** i18n Store */
interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'zh',
      t: zh,
      setLocale: (locale: Locale) =>
        set({ locale, t: localeMap[locale] }),
    }),
    {
      name: 'algo-eye-locale',
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        // 重新加载时根据存储的语言设置翻译
        if (state) {
          state.t = localeMap[state.locale];
        }
      },
    }
  )
);

/** 便捷 hook：获取翻译函数 */
export function useT() {
  return useI18n((s) => s.t);
}

/** 便捷 hook：获取当前语言 */
export function useLocale() {
  return useI18n((s) => s.locale);
}

/** 便捷 hook：切换语言 */
export function useSetLocale() {
  return useI18n((s) => s.setLocale);
}

/** 便捷 hook：翻译算法步骤消息 */
export function useTranslateMessage() {
  const locale = useI18n((s) => s.locale);
  return (message: string) => translateMessage(message, locale);
}
