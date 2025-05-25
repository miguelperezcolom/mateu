package com.example.demo;

import io.mateu.core.infra.InputStreamReader;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import lombok.extern.slf4j.Slf4j;

@Controller("/x")
@Slf4j
public class XController {

    @Get(value = "/{+path:[a-zA-Z/]+}", produces = MediaType.TEXT_HTML)
    public String getIndexAlways(String path, HttpRequest request) {
        return getIndex(request);
    }

    @Get(produces = MediaType.TEXT_HTML)
    public String getIndex(HttpRequest request) {
        String html = InputStreamReader.readFromClasspath(this.getClass(), "/static/index.html");
        html = html.replaceAll("<!-- AQUIFAVICON -->", "");
        html = html.replaceAll("AQUIELTITULODELAPAGINA", "Antonia app");
    //html = html.replaceAll("<!-- AQUIMATEU -->", "<script dataType='module' src='https://unpkg.com/mateu-ui/dist/assets/mateu.js'></script>");
        return html;
    }

}

