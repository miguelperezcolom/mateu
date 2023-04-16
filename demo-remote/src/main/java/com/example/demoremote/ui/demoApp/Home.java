package com.example.demoremote.ui.demoApp;

import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.ExternalScripts;
import io.mateu.mdd.shared.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.RawContent;
import lombok.Getter;
import org.springframework.stereotype.Component;

@Component
@Caption("")
@MateuUI("")
@ExternalScripts("https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js")
@Getter
public class Home extends DemoApp {

    @RawContent
    String someContent = """
            
            <h1>Hello!</h1>
            
            <p>This is some content for the home page.</p>
            
            """;

}
