package io.mateu;

import io.mateu.core.infra.WireMapper;
import io.mateu.dtos.RunActionRqDto;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.exceptions.HttpStatusException;

/**
 * The action request of Mateu's endpoints on Micronaut, read by Mateu rather than by Micronaut's
 * body binding: Micronaut binds a JSON body only for {@code application/json} (and its declared
 * extras), so an {@code application/*+json} body — which Mateu's rule ({@link
 * io.mateu.core.infra.security.JsonBodyGuard}) and every other adapter accept — answered 415. The
 * endpoints take the body as text ({@code consumes = ALL}); the guard has already refused anything
 * that is not declared JSON.
 */
public final class MicronautBodies {

  private MicronautBodies() {}

  /** The request in {@code body}; 400 when it is not one. */
  public static RunActionRqDto runActionRq(String body) {
    if (body == null || body.isBlank()) {
      throw new HttpStatusException(HttpStatus.BAD_REQUEST, "A JSON body is required");
    }
    try {
      return WireMapper.shared().readValue(body, RunActionRqDto.class);
    } catch (Exception e) {
      throw new HttpStatusException(HttpStatus.BAD_REQUEST, "The body is not a valid request");
    }
  }
}
