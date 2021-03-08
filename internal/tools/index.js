const buildQueryString = (fsyms, tsyms) =>
  "SELECT " +
  fsyms
    .reduce((acc, f) => {
      const subString = tsyms.map((t) => {
        return `
        data->'RAW'->'${f}'->'${t}' as "RAW.${f}.${t}",
        data->'DISPLAY'->'${f}'->'${t}' as "DISPLAY.${f}.${t}"`;
      });
      acc.push(subString);
      return acc;
    }, [])
    .join(",") +
  " FROM currency WHERE status='new';";

const parse = (data) =>
  Object.keys(data).reduce(
    (acc, key) => {
      if (!data[key]) {
        return acc;
      }
      const path = key.split(".");
      if (acc[path[0]].hasOwnProperty(path[1])) {
        acc[path[0]][path[1]][path[2]] = data[key];
      } else {
        acc[path[0]][path[1]] = {};
        acc[path[0]][path[1]][path[2]] = data[key];
      }
      return acc;
    },
    {
      RAW: {},
      DISPLAY: {},
    }
  );

module.exports = { buildQueryString, parse };
