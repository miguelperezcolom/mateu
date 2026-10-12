package com.example.parity;

import io.mateu.core.infra.security.AuthenticatedPrincipal;
import io.mateu.integrationtests.AdapterParityITFoundation;
import io.mateu.uidl.security.CallerIdentity;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.PreMatching;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;
import java.security.Principal;
import java.util.Arrays;
import java.util.List;

/**
 * Test-only authentication: a request carrying {@link
 * AdapterParityITFoundation#PARITY_ROLES_HEADER} gets a JAX-RS {@code SecurityContext} whose user
 * principal has those roles — what helidon-microprofile-jwt-auth (or any JAX-RS auth filter)
 * establishes, and what the generated controller hands to Mateu.
 */
@Provider
@PreMatching
@Priority(Priorities.AUTHENTICATION)
@ApplicationScoped
public class ParityRolesAuthentication implements ContainerRequestFilter {

  @Override
  public void filter(ContainerRequestContext request) {
    var roles = request.getHeaderString(AdapterParityITFoundation.PARITY_ROLES_HEADER);
    if (roles == null || roles.isBlank()) {
      return;
    }
    var principal =
        new AuthenticatedPrincipal(
            new CallerIdentity(
                "parity-user",
                Arrays.stream(roles.split(",")).map(String::trim).toList(),
                List.of(),
                List.of(),
                List.of()));
    var previous = request.getSecurityContext();
    request.setSecurityContext(
        new SecurityContext() {
          @Override
          public Principal getUserPrincipal() {
            return principal;
          }

          @Override
          public boolean isUserInRole(String role) {
            return principal.identity().roles().contains(role);
          }

          @Override
          public boolean isSecure() {
            return previous != null && previous.isSecure();
          }

          @Override
          public String getAuthenticationScheme() {
            return "parity";
          }
        });
  }
}
