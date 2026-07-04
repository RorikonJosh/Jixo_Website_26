/** Pick localized text field from a DB portfolio row. */
export function pickLocale(row, field, language) {
  if (!row) return '';
  const lang = normalizeLang(language);
  const key = `${field}_${lang}`;
  return row[key] || row[`${field}_zh`] || row[`${field}_jp`] || row[`${field}_en`] || '';
}

function normalizeLang(language) {
  if (!language) return 'zh';
  if (language.startsWith('zh')) return 'zh';
  if (language.startsWith('jp') || language.startsWith('ja')) return 'jp';
  return 'en';
}

export { normalizeLang };
