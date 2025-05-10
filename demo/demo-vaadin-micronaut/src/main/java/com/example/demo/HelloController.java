package com.example.demo;

import io.mateu.core.application.MateuService;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Produces;
import jakarta.inject.Inject;
import lombok.RequiredArgsConstructor;

@Controller("/hello")
public class HelloController {

    private final MateuService mateuService;

    @Inject
    public HelloController(MateuService mateuService) {
        this.mateuService = mateuService;
    }

    @Get
    @Produces(MediaType.TEXT_PLAIN)
    public String index(HttpRequest request) {
        return "Hello World";
    }
}