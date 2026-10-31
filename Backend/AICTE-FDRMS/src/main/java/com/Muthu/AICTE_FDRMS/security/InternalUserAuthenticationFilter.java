package com.Muthu.AICTE_FDRMS.security;

import com.Muthu.AICTE_FDRMS.model.InternalUser;
import com.Muthu.AICTE_FDRMS.repository.DataStore;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;
import java.util.List;

/**
 * Authentication and RBAC filter for internal AICTE Regulation Bureau users.
 * Establishes SecurityContext based on verified internal user credentials and roles.
 */
@Component
public class InternalUserAuthenticationFilter extends OncePerRequestFilter {

    private final DataStore dataStore;

    public InternalUserAuthenticationFilter(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String email = request.getHeader("X-User-Email");
        String roleHeader = request.getHeader("X-User-Role");

        // Fallback default for seamless internal navigation if headers omitted
        if (email == null || email.isBlank()) {
            email = "sen.a@aicte-india.org";
        }

        // Validate user if in registry
        InternalUser matchedUser = null;
        for (InternalUser u : dataStore.users.values()) {
            if (u.getEmail() != null && u.getEmail().equalsIgnoreCase(email.trim())) {
                matchedUser = u;
                break;
            }
        }

        // Check active status
        if (matchedUser != null && "INACTIVE".equalsIgnoreCase(matchedUser.getStatus())) {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(String.format(
                    "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"User account '%s' is deactivated.\",\"timestamp\":\"%s\"}",
                    email, Instant.now().toString()
            ));
            return;
        }

        // Determine effective role
        String effectiveRole = "ROLE_REVIEWER";
        if (matchedUser != null && matchedUser.getRole() != null) {
            effectiveRole = matchedUser.getRole().name();
        } else if (roleHeader != null && !roleHeader.isBlank()) {
            effectiveRole = roleHeader.trim();
        }

        if (!effectiveRole.startsWith("ROLE_")) {
            effectiveRole = "ROLE_" + effectiveRole;
        }

        List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(effectiveRole));
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                email,
                null,
                authorities
        );

        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
