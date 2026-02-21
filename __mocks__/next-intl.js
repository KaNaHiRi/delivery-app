// next-intl のモック
// C# で言うと「インターフェースのスタブ実装」に相当

const useTranslations = (namespace) => {
  return (key, params) => {
    // パラメータがある場合は展開（例: totalCount: "{count}件" → "5件"）
    if (params) {
      return Object.entries(params).reduce(
        (str, [k, v]) => str.replace(`{${k}}`, String(v)),
        key
      );
    }
    return key;
  };
};

const NextIntlClientProvider = ({ children }) => children;

const useLocale = () => 'ja';
const useMessages = () => ({});
const useNow = () => new Date();
const useTimeZone = () => 'Asia/Tokyo';
const useFormatter = () => ({});

module.exports = {
  useTranslations,
  NextIntlClientProvider,
  useLocale,
  useMessages,
  useNow,
  useTimeZone,
  useFormatter,
};