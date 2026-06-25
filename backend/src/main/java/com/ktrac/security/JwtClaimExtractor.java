package com.ktrac.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class JwtClaimExtractor {

    public Jwt getCurrentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            return (Jwt) authentication.getPrincipal();
        }
        return null;
    }

    public List<String> getRealmRoles() {
        Jwt jwt = getCurrentJwt();
        if (jwt == null) return Collections.emptyList();

        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            return (List<String>) realmAccess.get("roles");
        }
        return Collections.emptyList();
    }

    public Long getShedId() {
        Jwt jwt = getCurrentJwt();
        if (jwt == null) return null;

        Object shedId = jwt.getClaim("shed_id");
        if (shedId instanceof Number) {
            return ((Number) shedId).longValue();
        } else if (shedId instanceof String) {
            try {
                return Long.parseLong((String) shedId);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    public String getZone() {
        Jwt jwt = getCurrentJwt();
        if (jwt == null) return null;

        return jwt.getClaimAsString("zone");
    }

    public String getUsername() {
        Jwt jwt = getCurrentJwt();
        if (jwt == null) return null;

        return jwt.getClaimAsString("preferred_username");
    }
}
