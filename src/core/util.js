// DOM helper and the fatal-error banner.

const $ = (s) => document.querySelector(s);
function fail(msg) {
  const e = $('#err');
  e.hidden = false;
  e.textContent = msg;
}

export { $, fail };
