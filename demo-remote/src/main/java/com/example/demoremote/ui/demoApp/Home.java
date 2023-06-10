package com.example.demoremote.ui.demoApp;

import io.mateu.mdd.shared.annotations.*;
import lombok.Getter;
import org.springframework.stereotype.Component;

@Component
@Caption("")
@MateuUI("")
@ExternalScripts("https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js")
@Getter
//@KeycloakSecured(url = "http://keycloak.mateu.io", realm = "prueba", clientId = "cliente")
public class Home extends DemoApp {

    @RawContent
    String someContent = """
            
            <h1>Hello!</h1>
            
            <p>This is some content for the home page.</p>
            
            """;

}
