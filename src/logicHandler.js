export const validateInput = (text, rules) => {
  const results = [];
  const timestamp = new Date().toLocaleTimeString();

  if (rules.digits && /^[0-9]+$/.test(text)) results.push("NUMERIC");
  if (rules.boolean && /^(true|false|t|f)$/i.test(text)) results.push("BOOLEAN");
  if (rules.percent && text.includes('%')) results.push("PERCENTAGE");
  if (rules.decimal && /^\d+\.\d{2}$/.test(text)) results.push("DECIMAL");

  const finalResult = results.length > 0 ? results.join(" | ") : "INVALID_INPUT";
  
  return {
    time: timestamp,
    input: text || "(empty)",
    result: finalResult
  };
};
