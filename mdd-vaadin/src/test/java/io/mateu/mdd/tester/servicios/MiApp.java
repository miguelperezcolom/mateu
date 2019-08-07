package io.mateu.mdd.tester.servicios;

import io.mateu.mdd.core.rest.MateuRestApiResourceConfig;
import io.swagger.annotations.Contact;
import io.swagger.annotations.Info;
import io.swagger.annotations.SwaggerDefinition;

import javax.ws.rs.ApplicationPath;

@ApplicationPath("rest")
@SwaggerDefinition(info = @Info(
        title = "Example Service",
        description = "A simple example of apiee",
        version = "1.0.0",
        contact = @Contact(
                name = "Miguel Pérez Colom",
                email = "miguelperezcolom@gmail.com",
                url = "http://mateu.io"
        )
)
)
public class MiApp extends MateuRestApiResourceConfig {

    public String getPackagesToBeScanned() {
        return "io.mateu.mdd.tester.servicios";
    }

}
