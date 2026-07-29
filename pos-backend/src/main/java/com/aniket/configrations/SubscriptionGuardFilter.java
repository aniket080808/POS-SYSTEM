package com.aniket.configrations;

import com.aniket.domain.StoreStatus;
import com.aniket.domain.StoreSubscriptionStatus;
import com.aniket.domain.UserRole;
import com.aniket.modal.Branch;
import com.aniket.modal.Store;
import com.aniket.modal.StoreSubscription;
import com.aniket.modal.User;
import com.aniket.repository.BranchRepository;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.StoreSubscriptionRepository;
import com.aniket.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SubscriptionGuardFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final BranchRepository branchRepository;
    private final StoreSubscriptionRepository storeSubscriptionRepository;
    private final ObjectMapper objectMapper;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    // Whitelisted routes accessible without active subscription
    private static final List<String> WHITELIST = List.of(
            "/auth/**",
            "/api/users/profile/**",
            "/api/stores/admin",
            "/api/stores/employee",
            "/api/stores/*", // GET store by ID / PUT store basic info
            "/api/subscriptions/subscribe",
            "/api/subscriptions/upgrade",
            "/api/subscriptions/store/*",
            "/api/super-admin/subscription-plans",
            "/api/super-admin/subscription-plans/**",
            "/api/approval-requests/**",
            "/api/store-subscription/**",
            "/api/super-admin/**",
            "/api/payments/**"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Only enforce for /api/ routes
        if (!path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check whitelist
        for (String pattern : WHITELIST) {
            if (pathMatcher.match(pattern, path)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip for ROLE_ADMIN (super admin)
        boolean isSuperAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (isSuperAdmin) {
            filterChain.doFilter(request, response);
            return;
        }

        // Resolve store from security context user
        String email = auth.getName();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Store store = resolveStoreForUser(user);

        if (store == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1. Check Store Registration Status
        if (store.getStatus() != StoreStatus.ACTIVE) {
            String code = store.getStatus() == StoreStatus.REJECTED ? "REGISTRATION_REJECTED"
                    : store.getStatus() == StoreStatus.BLOCKED ? "REGISTRATION_BLOCKED"
                    : "REGISTRATION_PENDING";
            String msg = store.getStatus() == StoreStatus.REJECTED ? "Store registration was rejected."
                    : store.getStatus() == StoreStatus.BLOCKED ? "Store has been blocked."
                    : "Store registration pending approval.";
            writeForbiddenResponse(response, msg, code);
            return;
        }

        // 2. Check Store Subscription Status
        Optional<StoreSubscription> storeSubOpt = storeSubscriptionRepository.findByStoreId(store.getId());
        StoreSubscriptionStatus subStatus = storeSubOpt.map(StoreSubscription::getStatus).orElse(StoreSubscriptionStatus.NONE);

        if (subStatus != StoreSubscriptionStatus.ACTIVE) {
            String code = subStatus == StoreSubscriptionStatus.PENDING ? "SUBSCRIPTION_PENDING"
                    : subStatus == StoreSubscriptionStatus.REJECTED ? "SUBSCRIPTION_REJECTED"
                    : "SUBSCRIPTION_NONE";
            String msg = subStatus == StoreSubscriptionStatus.PENDING ? "Subscription request is pending approval."
                    : subStatus == StoreSubscriptionStatus.REJECTED ? "Subscription request was rejected."
                    : "No active subscription. Please subscribe to a plan to unlock full access.";
            writeForbiddenResponse(response, msg, code);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Store resolveStoreForUser(User user) {
        if (user.getRole() == UserRole.ROLE_STORE_ADMIN || user.getRole() == UserRole.ROLE_STORE_MANAGER) {
            return storeRepository.findByStoreAdminId(user.getId());
        } else if (user.getRole() == UserRole.ROLE_BRANCH_MANAGER || user.getRole() == UserRole.ROLE_BRANCH_ADMIN || user.getRole() == UserRole.ROLE_BRANCH_CASHIER) {
            // Find branch by employee
            List<Branch> branches = branchRepository.findByStoreId(null); // search branches
            // Alternatively, find store directly if branch is linked to user or store
            // Query store by employee if user belongs to a branch
            return storeRepository.findAll().stream()
                    .filter(s -> s.getStoreAdmin() != null)
                    .findFirst().orElse(null);
        }
        return storeRepository.findByStoreAdminId(user.getId());
    }

    private void writeForbiddenResponse(HttpServletResponse response, String message, String code) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("application/json");

        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        body.put("code", code);

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
