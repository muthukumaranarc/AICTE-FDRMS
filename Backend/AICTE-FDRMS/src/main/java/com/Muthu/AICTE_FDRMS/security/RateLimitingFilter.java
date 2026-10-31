package com.Muthu.AICTE_FDRMS.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Defense-in-depth Sliding Window Rate Limiting Filter.
 * Mitigates DoS, brute-force scrutiny submissions, and aggressive scraping.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_GENERAL_REQUESTS_PER_MINUTE = 200;
    private static final int MAX_MUTATION_REQUESTS_PER_MINUTE = 60;

    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    private static class RequestCounter {
        long windowStartTimestamp;
        AtomicInteger generalCount = new AtomicInteger(0);
        AtomicInteger mutationCount = new AtomicInteger(0);

        RequestCounter(long windowStart) {
            this.windowStartTimestamp = windowStart;
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip rate limiting for static assets and CORS preflight options
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        long currentWindow = Instant.now().getEpochSecond() / 60; // 1-minute window bucket

        RequestCounter counter = requestCounts.compute(clientIp, (key, existing) -> {
            if (existing == null || existing.windowStartTimestamp != currentWindow) {
                return new RequestCounter(currentWindow);
            }
            return existing;
        });

        boolean isMutation = "POST".equalsIgnoreCase(request.getMethod())
                || "PUT".equalsIgnoreCase(request.getMethod())
                || "DELETE".equalsIgnoreCase(request.getMethod());

        int currentCount = isMutation ? counter.mutationCount.incrementAndGet() : counter.generalCount.incrementAndGet();
        int maxAllowed = isMutation ? MAX_MUTATION_REQUESTS_PER_MINUTE : MAX_GENERAL_REQUESTS_PER_MINUTE;

        if (currentCount > maxAllowed) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", "60");
            response.getWriter().write(String.format(
                    "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded for IP. Please wait 60 seconds before retrying.\",\"timestamp\":\"%s\"}",
                    Instant.now().toString()
            ));
            return;
        }

        // Periodic cleanup of stale counters if size grows large
        if (requestCounts.size() > 5000) {
            requestCounts.entrySet().removeIf(e -> e.getValue().windowStartTimestamp < currentWindow - 2);
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
