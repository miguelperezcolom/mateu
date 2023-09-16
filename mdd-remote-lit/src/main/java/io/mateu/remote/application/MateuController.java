package io.mateu.remote.application;

import io.mateu.util.Helper;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/assets")
@Slf4j
public class MateuController {

  @GetMapping(value = "**")
  public ResponseEntity<String> getAssets(ServerHttpRequest request) {
    String[] tokens = request.getURI().toString().split("/assets");
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
    String html = Helper.leerFichero(this.getClass(), "/npm/mateu/assets/" + path);
    return new ResponseEntity(html, httpHeaders, HttpStatus.OK);
  }
}
