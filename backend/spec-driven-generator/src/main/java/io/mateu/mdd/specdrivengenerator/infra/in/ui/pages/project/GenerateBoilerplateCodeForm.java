package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.project;

import io.mateu.mdd.specdrivengenerator.application.usecases.project.generatecode.GenerateCodeCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.project.generatecode.GenerateCodeUseCase;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.net.URI;

@Service
@Scope("prototype")
@Slf4j
@RequiredArgsConstructor
@Style("max-width:900px;margin: auto;")
@Title("Generate boilerplate code")
public class GenerateBoilerplateCodeForm {

    final GenerateCodeUseCase useCase;

    String projectId;

    String outputPath;

    String packageName;

    boolean sourceOnly;

    @Button
    URI generateCode() {
        log.info("Generating code for project " + projectId);
        useCase.handle(new GenerateCodeCommand(projectId, outputPath, packageName, sourceOnly));
        return URI.create("/projects/" + projectId);
    };

}
