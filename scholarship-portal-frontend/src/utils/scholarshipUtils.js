const PROVIDER_LINKS = {
  BUDDY4STUDY: 'https://www.buddy4study.com/scholarships',
  VIDYALAKSHMI: 'https://www.vidyalakshmi.co.in/Students/',
  AICTE: 'https://www.aicte-india.org/bureaus/jk/scholarship',
  UGC: 'https://www.ugc.gov.in/',
  PMRF: 'https://pmrf.in/',
  DST: 'https://dst.gov.in/',
  MHRD: 'https://www.education.gov.in/',
  NSP: 'https://scholarships.gov.in/',
  'SYSTEM ADMIN': 'https://scholarships.gov.in/',
  AUTO_SCRAPER: 'https://scholarships.gov.in/'
};

const ensureSlashAfterDomain = (link, domain) => {
  const expression = new RegExp(`(https?:\\/\\/(?:www\\.)?${domain.replace(/\./g, '\\.')})(?=[A-Za-z0-9])`, 'i');
  return link.replace(expression, '$1/');
};

export const normalizeScholarshipLink = (rawLink, provider) => {
  let link = rawLink?.trim() || '';
  if (!link) {
    return PROVIDER_LINKS[(provider || '').trim().toUpperCase()] || 'https://scholarships.gov.in/';
  }

  link = link.replace(/\\/g, '/');
  while (/^https?:\/\/https?:\/\//i.test(link)) {
    link = link.replace(/^https?:\/\/(https?:\/\/.*)$/i, '$1');
  }

  if (link.startsWith('www.')) {
    link = `https://${link}`;
  }

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(link)) {
    link = `https://${link}`;
  }

  link = ensureSlashAfterDomain(link, 'scholarships.gov.in');
  link = ensureSlashAfterDomain(link, 'buddy4study.com');
  link = ensureSlashAfterDomain(link, 'vidyalakshmi.co.in');
  link = ensureSlashAfterDomain(link, 'aicte-india.org');

  return link;
};

export const enrichScholarship = (scholarship) => {
  if (!scholarship) {
    return scholarship;
  }

  return {
    ...scholarship,
    applicationLink: normalizeScholarshipLink(scholarship.applicationLink, scholarship.provider)
  };
};

export const enrichScholarshipCollection = (scholarships) => (
  Array.isArray(scholarships) ? scholarships.map(enrichScholarship) : []
);

export const paginateItems = (items, currentPage, pageSize) => {
  const startIndex = currentPage * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
};