export const validateInput = (text, rules) => {
  const results = [];

  if (rules.digits && /^[0-9]+$/.test(text)) {
    results.push("Matches 0-9");
  }
  if (rules.boolean && /^(true|false|t|f)$/i.test(text)) {
    results.push("Matches T/F");
  }
  if (rules.percent && text.includes('%')) {
    results.push("Matches %");
  }
  if (rules.decimal && /^\d+\.\d{2}$/.test(text)) {
    results.push("Matches 00.00");
  }

  return results.length > 0 ? results.join(", ") : "No match found.";
};
