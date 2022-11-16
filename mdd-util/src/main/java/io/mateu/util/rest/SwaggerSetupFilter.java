package io.mateu.util.rest;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import java.io.IOException;

@WebFilter(filterName="SwaggerSetupFilter",urlPatterns="*/swagger.json" )
public class SwaggerSetupFilter implements Filter {

    public static String scheme;
    public static String name;
    public static int port;


    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        scheme = servletRequest.getScheme();
        name = servletRequest.getServerName();
        port = servletRequest.getServerPort();
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
