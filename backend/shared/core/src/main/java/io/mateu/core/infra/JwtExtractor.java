package io.mateu.core.infra;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Optional;

/**
 * Extracts presentation-level identity claims (e.g. a display username) from a
 * JWT already present on the request.
 *
 * <p><b>Trust boundary:</b> this class assumes the token has already been
 * validated upstream — by the resource server (e.g. Spring Security) or an API
 * gateway — including signature, {@code exp}, {@code iss}, and {@code aud}. It
 * performs no verification itself.
 *
 * <p><b>The values returned here are for display only.</b> Never use them to
 * make an authorization decision; those must be enforced by whatever component
 * secured the endpoint.
 */
public class JwtExtractor {

  public static Optional<String> getUsername(HttpRequest httpRequest) {

    var rawHeader = httpRequest.getHeaderValue("Authorization");

    if (rawHeader == null) return Optional.empty();

    // 1. Strip the Bearer prefix
    String token = rawHeader.replace("Bearer ", "");

    // 2. Decode directly (this does NOT verify the signature)
    DecodedJWT decodedJWT = JWT.decode(token);

    // 3. Extract the subject
    var userName = decodedJWT.getClaim("preferred_username");
    if (userName != null) return Optional.of(userName.asString());
    return Optional.ofNullable(decodedJWT.getSubject());
  }
}
