package io.mateu.core.domain;

import static io.mateu.core.infra.JsonSerializer.fromJson;

import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;

public class Authorizer {

  public static boolean isAuthorized(EyesOnly eyesOnly, HttpRequest httpRequest) {
    if (eyesOnly == null) return true;
    if (httpRequest == null) return false; // Si no hay request y hay restricciones, denegamos

    String authHeader = httpRequest.getHeaderValue("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      return false; // No hay token, no hay acceso a contenido restringido
    }

    try {
      // 1. Extraer y decodificar el payload (Base64URL safe)
      String token = authHeader.substring(7);
      String[] parts = token.split("\\.");
      if (parts.length < 2) return false;

      String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
      Map<String, Object> claims = fromJson(payload);

      // 2. Verificar ROLES (desde realm_access.roles que inyectó el Gateway)
      if (eyesOnly.roles().length > 0) {
        Map<String, Object> realmAccess = (Map<String, Object>) claims.get("realm_access");
        List<String> userRoles =
            (realmAccess != null) ? (List<String>) realmAccess.get("roles") : List.of();

        boolean hasRequiredRole = Arrays.stream(eyesOnly.roles()).anyMatch(userRoles::contains);

        if (!hasRequiredRole) return false;
      }

      // 3. Verificar SCOPES (desde el claim "scope" que inyectó el Gateway)
      if (eyesOnly.scopes().length > 0) {
        String scopeClaim = (String) claims.get("scope");
        List<String> userScopes =
            (scopeClaim != null) ? Arrays.asList(scopeClaim.split(" ")) : List.of();

        boolean hasRequiredScope = Arrays.stream(eyesOnly.scopes()).anyMatch(userScopes::contains);

        if (!hasRequiredScope) return false;
      }

      return true; // Ha pasado todas las pruebas activas

    } catch (Exception e) {
      // Si el token está mal formado o hay error de casteo, denegamos por seguridad
      return false;
    }
  }
}
