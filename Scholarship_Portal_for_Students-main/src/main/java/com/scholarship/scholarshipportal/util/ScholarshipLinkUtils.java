package com.scholarship.scholarshipportal.util;

public final class ScholarshipLinkUtils {

    private ScholarshipLinkUtils() {
    }

    public static String normalize(String rawLink, String provider) {
        String link = rawLink != null ? rawLink.trim() : "";
        if (link.isBlank()) {
            return defaultLinkForProvider(provider);
        }

        link = link.replace('\\', '/');
        while (link.matches("(?i)^https?://https?://.*$")) {
            link = link.replaceFirst("(?i)^https?://(https?://.*)$", "$1");
        }

        if (link.startsWith("www.")) {
            link = "https://" + link;
        }

        if (!link.matches("(?i)^[a-z][a-z0-9+.-]*://.*$")) {
            link = "https://" + link;
        }

        link = ensureSlashAfterDomain(link, "scholarships.gov.in");
        link = ensureSlashAfterDomain(link, "www.scholarships.gov.in");
        link = ensureSlashAfterDomain(link, "buddy4study.com");
        link = ensureSlashAfterDomain(link, "www.buddy4study.com");
        link = ensureSlashAfterDomain(link, "vidyalakshmi.co.in");
        link = ensureSlashAfterDomain(link, "www.vidyalakshmi.co.in");
        link = ensureSlashAfterDomain(link, "aicte-india.org");
        link = ensureSlashAfterDomain(link, "www.aicte-india.org");

        return link;
    }

    private static String ensureSlashAfterDomain(String link, String domain) {
        String httpsPrefix = "https://" + domain;
        if (link.regionMatches(true, 0, httpsPrefix, 0, httpsPrefix.length()) && link.length() > httpsPrefix.length()) {
            char nextChar = link.charAt(httpsPrefix.length());
            if (nextChar != '/') {
                return httpsPrefix + "/" + link.substring(httpsPrefix.length());
            }
        }

        String httpPrefix = "http://" + domain;
        if (link.regionMatches(true, 0, httpPrefix, 0, httpPrefix.length()) && link.length() > httpPrefix.length()) {
            char nextChar = link.charAt(httpPrefix.length());
            if (nextChar != '/') {
                return httpPrefix + "/" + link.substring(httpPrefix.length());
            }
        }

        return link;
    }

    public static String defaultLinkForProvider(String provider) {
        String normalizedProvider = provider != null ? provider.trim().toUpperCase() : "";
        return switch (normalizedProvider) {
            case "BUDDY4STUDY" -> "https://www.buddy4study.com/scholarships";
            case "VIDYALAKSHMI" -> "https://www.vidyalakshmi.co.in/Students/";
            case "AICTE" -> "https://www.aicte-india.org/bureaus/jk/scholarship";
            case "UGC" -> "https://www.ugc.gov.in/";
            case "PMRF" -> "https://pmrf.in/";
            case "DST" -> "https://dst.gov.in/";
            case "MHRD" -> "https://www.education.gov.in/";
            case "NSP", "SYSTEM ADMIN", "AUTO_SCRAPER", "" -> "https://scholarships.gov.in/";
            default -> "https://scholarships.gov.in/";
        };
    }
}