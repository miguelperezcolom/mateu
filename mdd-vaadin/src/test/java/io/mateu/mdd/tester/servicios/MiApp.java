package io.mateu.mdd.tester.servicios;

import org.glassfish.jersey.server.ResourceConfig;

import javax.ws.rs.ApplicationPath;

@ApplicationPath("rest")
public class MiApp extends ResourceConfig {
    public MiApp() {
        packages("org.foo.rest;io.mateu.mdd.rest;io.mateu.mdd.tester.servicios");
    }
}
