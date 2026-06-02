package io.mateu.workflow.vaadin;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.util.Collections;

@RestController
public class ProxyController {

    private final RestClient restClient = RestClient.builder()
            .baseUrl("http://localhost:8301")
            .build();

    @RequestMapping("/mateu/v3/**")
    public ResponseEntity<byte[]> proxy(HttpServletRequest request) throws IOException {
        String uri = request.getRequestURI();
        String query = request.getQueryString();
        String targetUri = query != null ? uri + "?" + query : uri;

        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        byte[] body = request.getInputStream().readAllBytes();

        HttpHeaders headers = new HttpHeaders();
        Collections.list(request.getHeaderNames()).forEach(name -> {
            if (!name.equalsIgnoreCase("host") && !name.equalsIgnoreCase("transfer-encoding")) {
                headers.add(name, request.getHeader(name));
            }
        });

        return restClient.method(method)
                .uri(targetUri)
                .headers(h -> h.addAll(headers))
                .body(body)
                .exchange((req, res) -> {
                    byte[] responseBody = res.getBody().readAllBytes();
                    HttpHeaders responseHeaders = new HttpHeaders();
                    res.getHeaders().forEach((name, values) -> {
                        if (!name.equalsIgnoreCase("transfer-encoding")) {
                            responseHeaders.addAll(name, values);
                        }
                    });
                    return ResponseEntity.status(res.getStatusCode())
                            .headers(responseHeaders)
                            .body(responseBody);
                });
    }
}
