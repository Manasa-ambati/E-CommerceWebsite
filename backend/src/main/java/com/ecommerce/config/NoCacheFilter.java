package com.ecommerce.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Global Cache Disable Filter
 * Ensures all responses are not cached by browser or proxy
 * Critical for Railway deployment to prevent stale content
 */
@Component
public class NoCacheFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse res = (HttpServletResponse) response;

        // HTTP 1.1 - Modern browsers
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        
        // HTTP 1.0 - Older browsers
        res.setHeader("Pragma", "no-cache");
        
        // Proxies
        res.setHeader("Expires", "0");

        chain.doFilter(request, response);
    }
}
