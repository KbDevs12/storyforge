function formatOptions(options = []) {
  if (!Array.isArray(options) || options.length === 0) return "";
  const parts = options.map((o) => {
    const token = o.required ? `<${o.name}>` : `[${o.name}]`;
    return token;
  });
  return parts.length ? " " + parts.join(" ") : "";
}

function buildUsagesFromJSON(data) {
  const name = `/${data.name}`;
  const options = data.options ?? [];
  const lines = [];

  if (options.length === 0) return [name];

  const hasStructured = options.some((o) => o.type === 1 || o.type === 2);

  if (!hasStructured) {
    lines.push(name + formatOptions(options));
    return lines;
  }

  for (const opt of options) {
    if (opt.type === 1) {
      lines.push(`${name} ${opt.name}` + formatOptions(opt.options));
    } else if (opt.type === 2) {
      for (const sub of opt.options ?? []) {
        lines.push(
          `${name} ${opt.name} ${sub.name}` + formatOptions(sub.options)
        );
      }
    }
  }
  return lines.length ? lines : [name];
}

function getUsage(command) {
  if (command.usage)
    return Array.isArray(command.usage) ? command.usage : [command.usage];

  const data = command?.data?.toJSON?.();
  if (!data) return ["/unknown"];

  return buildUsagesFromJSON(data);
}

module.exports = { getUsage };
