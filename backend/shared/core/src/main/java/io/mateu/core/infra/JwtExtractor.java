package io.mateu.core.infra;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Optional;

public class JwtExtractor {

  public static Optional<String> getUsername(HttpRequest httpRequest) {

    var rawHeader = httpRequest.getHeaderValue("Authorization");

    if (rawHeader == null) return Optional.empty();

    // 1. Limpiar el token
    String token = rawHeader.replace("Bearer ", "");

    // 2. Decodificar directamente (esto NO verifica la firma)
    DecodedJWT decodedJWT = JWT.decode(token);

    // 3. Obtener el subject
    var userName = decodedJWT.getClaim("preferred_username");
    if (userName != null) return Optional.of(userName.asString());
    return Optional.ofNullable(decodedJWT.getSubject());
  }
}
