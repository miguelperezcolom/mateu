package io.mateu.annotationprocessing.testcases.helloworld;

import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIMapper;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.uidl.interfaces.ReflectionHelper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import io.mateu.core.domain.model.util.InputStreamReader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct;

import java.util.Map;


@RestController("io.mateu.annotationProcessing.testcases.helloworld.HelloWorldController")
@RequestMapping("")
@Slf4j
public class HelloWorldController {

    @Value("${spring.devtools.livereload.enabled:false}")
    private boolean liveReloadEnabled;
    @Autowired
    private UIMapper uiMapper;
    @Autowired
    private ReflectionHelper reflectionHelper;

    @GetMapping(value = "", produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex() {
        String html = InputStreamReader.readFromClasspath(this.getClass(), "/index/index.html");
        html = html.replaceAll("<!-- AQUIFAVICON -->", "");
        html = html.replaceAll("AQUIELTITULODELAPAGINA", "Hello world");
        //html = html.replaceAll("<!-- AQUIMATEU -->", "<script dataType='module' src='https://unpkg.com/mateu-ui/dist/assets/mateu.js'></script>");
        html = html.replaceAll("<!-- AQUIMATEU -->", "<script dataType='module' src='/dist/assets/mateu.js'></script>"
                + (liveReloadEnabled?
                "<script src='http://localhost:35729/livereload.js'></script>":""));
        html = html.replaceAll("<!-- AQUIUI -->", "<mateu-ui baseUrl=''></mateu-ui>");
        return html;
    }


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
        String html = InputStreamReader.readFromClasspath(this.getClass(), pkg + path);
        return new ResponseEntity(html, httpHeaders, HttpStatus.OK);
    }

    @GetMapping(value = "/dist/**")
    public ResponseEntity<String> getDist(ServerHttpRequest request) {
        return getFromClasspath(request.getURI().toString(), "dist", "/npm/mateu/dist/");
    }



}

