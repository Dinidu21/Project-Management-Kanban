package com.dinidu.pms.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.Charset;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;

/**
 * Logs inbound HTTP requests and outbound responses with duration and authenticated user.
 * Uses ContentCaching wrappers to safely read request/response bodies after processing.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class HttpLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(HttpLoggingFilter.class);

    private static final Set<String> EXCLUDED_PATH_PREFIXES = Set.of(
            "/actuator/health", "/error", "/favicon", "/css/", "/js/", "/images/", "/static/"
    );

    private static final int MAX_LOG_BODY_CHARS = 2000;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        for (String prefix : EXCLUDED_PATH_PREFIXES) {
            if (uri.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        ContentCachingRequestWrapper cachingRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper cachingResponse = new ContentCachingResponseWrapper(response);

        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();
        String clientIp = getClientIp(request);
        String user = getCurrentUsername();

        Instant start = Instant.now();
        log.info("HTTP IN > {} {}{} | user={} | ip={}",
                method,
                uri,
                query != null ? "?" + query : "",
                user,
                clientIp);

        try {
            filterChain.doFilter(cachingRequest, cachingResponse);
        } finally {
            Instant end = Instant.now();
            long ms = Duration.between(start, end).toMillis();

            int status = cachingResponse.getStatus();

            String requestBody = resolveBody(cachingRequest.getContentAsByteArray(),
                    cachingRequest.getContentType(), cachingRequest.getCharacterEncoding());
            String maskedRequestBody = Masking.maskSensitiveJson(requestBody);

            String responseBody = resolveBody(cachingResponse.getContentAsByteArray(),
                    cachingResponse.getContentType(), cachingResponse.getCharacterEncoding());
            String maskedResponseBody = Masking.maskSensitiveJson(responseBody);

            if (maskedRequestBody != null && !maskedRequestBody.isBlank()) {
                maskedRequestBody = trimBody(maskedRequestBody);
                log.debug("HTTP IN BODY > {} {}{} | body={}",
                        method, uri, query != null ? "?" + query : "", maskedRequestBody);
            }

            if (maskedResponseBody != null && !maskedResponseBody.isBlank()) {
                maskedResponseBody = trimBody(maskedResponseBody);
                log.debug("HTTP OUT BODY < {} {} | status={} | body={}",
                        method, uri, status, maskedResponseBody);
            }

            log.info("HTTP OUT < {} {} | status={} | user={} | {}ms",
                    method, uri, status, user, ms);

            cachingResponse.copyBodyToResponse();
        }
    }

    private static String getClientIp(HttpServletRequest request) {
        String h = request.getHeader("X-Forwarded-For");
        if (h != null && !h.isBlank()) {
            // first IP in the list is the original client
            int idx = h.indexOf(',');
            return idx > 0 ? h.substring(0, idx).trim() : h.trim();
        }
        return request.getRemoteAddr();
    }

    private static String getCurrentUsername() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                Object principal = auth.getPrincipal();
                return principal != null ? String.valueOf(principal) : "anonymous";
            }
        } catch (Exception ignored) {
        }
        return "anonymous";
    }

    private static String resolveBody(byte[] content, String contentType, String encoding) {
        if (content == null || content.length == 0) return null;

        // only log textual bodies
        if (contentType == null) return null;
        try {
            MediaType mt = MediaType.parseMediaType(contentType);
            boolean textual = MimeTypeUtils.APPLICATION_JSON.includes(mt)
                    || MimeTypeUtils.TEXT_PLAIN.includes(mt)
                    || MimeTypeUtils.TEXT_HTML.includes(mt)
                    || "application".equals(mt.getType()) && "x-www-form-urlencoded".equals(mt.getSubtype());

            if (!textual) return null;
        } catch (Exception e) {
            // if cannot parse, be conservative and do not log
            return null;
        }

        Charset cs = Charset.forName(encoding != null ? encoding : "UTF-8");
        return new String(content, cs);
    }

    private static String trimBody(String s) {
        if (s == null) return null;
        if (s.length() > MAX_LOG_BODY_CHARS) {
            return s.substring(0, MAX_LOG_BODY_CHARS) + "...(truncated)";
        }
        return s;
    }

    /**
     * Simple masking helper for sensitive JSON keys commonly found in auth flows.
     */
    static class Masking {
        private static final Set<String> SENSITIVE_KEYS = Set.of(
                "password", "pwd", "secret", "token", "accessToken", "refreshToken", "authorization"
        );

        static String maskSensitiveJson(String body) {
            if (body == null) return null;
            String trimmed = body.trim();
            // very light-weight masking: replace values for known keys in naive JSON
            // patterns like: "password":"value" or 'password':'value'
            String masked = trimmed;
            for (String key : SENSITIVE_KEYS) {
                // "key":"..."; allow whitespace and both quote types
                String regex = "(?i)(\\\"" + key + "\\\"\\s*:\\s*\\\")(.*?)(\\\")";
                masked = masked.replaceAll(regex, "$1***$3");
                // 'key':'...'
                String regexSingle = "(?i)(\\'" + key + "\\'\\s*:\\s*\\')(.*?)(\\')";
                masked = masked.replaceAll(regexSingle, "$1***$3");
            }
            // Also mask Bearer tokens in raw strings
            masked = masked.replaceAll("(?i)Bearer\\s+[A-Za-z0-9\\-_.=]+", "Bearer ***");
            return masked;
        }
    }
}