package io.mateu.remote.application;

import io.mateu.core.domain.util.Helper;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mateu")
@Slf4j
public class MateuController {

  @GetMapping(value = "/assets/**")
  public ResponseEntity<String> getAssets(ServerHttpRequest request) {
    return getFromClasspath(request.getURI().toString(), "assets", "/npm/mateu/assets/");
  }

  private ResponseEntity<String> getFromClasspath(String uri, String key, String pkg) {
    String[] tokens = uri.split("/" + key);
    String path = tokens.length > 1 ? tokens[1] : "";
    String suffix =
        path.contains(".") ? path.substring(path.lastIndexOf('.')).replaceAll("\\.", "") : "";
    final HttpHeaders httpHeaders = new HttpHeaders();
    httpHeaders.add(
        "Content-Type",
        Map.of("js", "application/javascript", "css", "text/css")
            .getOrDefault(suffix, MediaType.TEXT_PLAIN_VALUE.toString()));
    if (path.startsWith("/")) {
      path = path.substring(1);
    }
    String html = Helper.leerFichero(this.getClass(), pkg + path);
    return new ResponseEntity(html, httpHeaders, HttpStatus.OK);
  }

  @GetMapping(value = "/dist/**")
  public ResponseEntity<String> getDist(ServerHttpRequest request) {
    return getFromClasspath(request.getURI().toString(), "dist", "/npm/mateu/dist/");
  }
}
