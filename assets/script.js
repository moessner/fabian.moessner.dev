'use strict';

(function () {

  function parseDate(value) {
    if (!value) {
      return null;
    }
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || trimmed === 'present' || trimmed === 'current') {
      return null;
    }
    let normalized = trimmed;
    if (/^\d{4}-\d{2}$/.test(trimmed)) {
      normalized += '-01';
    }
    const parsed = new Date(normalized);
    if (isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  }

  function computeDuration(startDate, endDate) {
    if (!startDate || !endDate) {
      return { years: 0, months: 0 };
    }

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const startDay = startDate.getDate();

    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    const endDay = endDate.getDate();

    let years = endYear - startYear;
    let months = endMonth - startMonth;

    if (endDay < startDay) {
      months -= 1;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    if (years < 0) {
      years = 0;
      months = 0;
    }
    return { years: years, months: months };
  }

  function formatDuration(duration) {
    const parts = [];
    if (duration.years > 0) {
      parts.push(duration.years + ' yr' + (duration.years === 1 ? '' : 's'));
    }
    if (duration.months > 0) {
      parts.push(duration.months + ' mo' + (duration.months === 1 ? '' : 's'));
    }
    if (!parts.length) {
      parts.push('Less than 1 mo');
    }
    return parts.join(' ');
  }

  function updateTenureDurations(now) {
    const nodes = document.querySelectorAll('.tenure-duration[data-tenure-start]');
    nodes.forEach(function (node) {
      const startAttr = node.dataset.tenureStart;
      const endAttr = node.dataset.tenureEnd;
      const startDate = parseDate(startAttr);
      let endDate = parseDate(endAttr) || now;

      if (!startDate) {
        return;
      }
      if (endDate < startDate) {
        endDate = startDate;
      }

      const duration = computeDuration(startDate, endDate);
      const durationText = formatDuration(duration);
      const previous = node.previousSibling;
      const hasLeadingText = Boolean(previous && previous.textContent && previous.textContent.trim().length > 0);

      if (hasLeadingText) {
        node.textContent = ' · ' + durationText;
      } else {
        node.textContent = durationText + ' · ';
      }

      node.setAttribute('aria-label', 'Duration ' + durationText);
    });
  }

  function updateCurrentYear(now) {
    const node = document.querySelector('[data-current-year]');
    if (!node) {
      return;
    }
    node.textContent = String(now.getFullYear());
    node.setAttribute('aria-label', 'Year ' + node.textContent);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      const now = new Date();
      updateTenureDurations(now);
      updateCurrentYear(now);
    });
  } else {
    const now = new Date();
    updateTenureDurations(now);
    updateCurrentYear(now);
  }
})();
