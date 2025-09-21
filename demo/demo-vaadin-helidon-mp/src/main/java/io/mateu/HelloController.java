package io.mateu;

import io.mateu.core.infra.InputStreamReader;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.extern.slf4j.Slf4j;

@Path("")
@Slf4j
public class HelloController {

    @Path("/{path}")
    @GET
    @Produces(MediaType.TEXT_HTML)
    public String getIndexAlways(@PathParam("path") String path) {
        return getIndex();
    }

    @GET
    @Produces(MediaType.TEXT_HTML)
    public String getIndex() {
        String html = InputStreamReader.readFromClasspath(this.getClass(), "/static/index.html");
        html = html.replaceAll("<!-- AQUIFAVICON -->", "");
        html = html.replaceAll("AQUIELTITULODELAPAGINA", "Hello world");
        html = html.substring(0, html.indexOf("<!-- AQUIUI -->"))
                + "<mateu-ui baseUrl=\"\"></mateu-ui>"
                + html.substring(html.indexOf("<!-- HASTAAQUIUI -->"));
        return html;
    }

}


