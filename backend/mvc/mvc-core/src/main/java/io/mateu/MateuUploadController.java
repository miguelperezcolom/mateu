package io.mateu;

import io.mateu.core.infra.uploads.UploadEndpoint;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/**
 * {@code POST /mateu/v3/upload} and {@code /mateu/v3/upload/target} on Spring MVC: the HTTP shell
 * of {@link UploadEndpoint}. The body is read straight from the servlet stream — never buffered —
 * so a large file goes to the application's store as it arrives.
 */
@RestController
public class MateuUploadController {

  private final UploadEndpoint endpoint = new UploadEndpoint();

  @PostMapping(value = UploadEndpoint.PATH, produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<String> upload(HttpServletRequest request) throws IOException {
    var answer =
        endpoint.upload(
            request.getHeader(UploadEndpoint.TICKET_HEADER),
            request.getHeader(UploadEndpoint.NAME_HEADER),
            request.getContentType(),
            request.getContentLengthLong(),
            request.getInputStream(),
            new SpringHttpRequest(request));
    return json(answer);
  }

  @PostMapping(value = UploadEndpoint.TARGET_PATH, produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<String> target(
      @RequestHeader(name = UploadEndpoint.TICKET_HEADER, required = false) String ticket,
      @RequestBody(required = false) String body,
      HttpServletRequest request) {
    return json(endpoint.target(ticket, body, new SpringHttpRequest(request)));
  }

  private static ResponseEntity<String> json(UploadEndpoint.Answer answer) {
    return ResponseEntity.status(answer.status())
        .contentType(MediaType.APPLICATION_JSON)
        .body(answer.body());
  }
}
