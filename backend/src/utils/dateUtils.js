const dayjs = require('dayjs');

// NOTE: If you prefer not to add dayjs as a dependency, you can
// rewrite this with native Date ops. For now, keep simple helpers here.

const toDateKey = (date = new Date()) => {
  const d = dayjs(date);
  return d.format('YYYY-MM-DD');
};

const toTimeString = (date = new Date()) => {
  const d = dayjs(date);
  return d.format('HH:mm:ss');
};

module.exports = {
  toDateKey,
  toTimeString
};

