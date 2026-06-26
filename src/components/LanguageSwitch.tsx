// ============================================================
// LanguageSwitch — 语言切换按钮（终端风格）
// ============================================================

import { useI18n, type Locale } from '../i18n';

const LOCALE_LABELS: Record<Locale, string> = {
  zh: '中',
  en: 'EN',
};

export function LanguageSwitch() {
  const locale = useI18n((s) => s.locale);
  const setLocale = useI18n((s) => s.setLocale);

  const toggle = () => {
    setLocale(locale === 'zh' ? 'en' : 'zh');
  };

  return (
    <button
      className="lang-switch"
      onClick={toggle}
      title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      {LOCALE_LABELS[locale === 'zh' ? 'en' : 'zh']}
    </button>
  );
}
