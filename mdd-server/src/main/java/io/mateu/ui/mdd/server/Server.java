package io.mateu.ui.mdd.server;

import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.server.ResourceConfig;

import javax.ws.rs.core.UriBuilder;
import java.net.URI;

public class Server {

    public static void main(String[] args) {

        URI baseUri = UriBuilder.fromUri("http://0.0.0.0/").port(Integer.parseInt(System.getProperty("port", "9998"))).build();
        ResourceConfig config = new ResourceConfig(
                MDDResourceImpl.class
        );
        HttpServer server = GrizzlyHttpServerFactory.createHttpServer(baseUri, config);

        System.out.println("Servidor arrancado ;)");
    }
}
