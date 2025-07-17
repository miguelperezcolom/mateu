package com.example.demo;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/hello")
public class ExampleResource {

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/{name:.*}")
    public String hello(String name) {
        return "Hello from Quarkus REST " + name;
    }
}
