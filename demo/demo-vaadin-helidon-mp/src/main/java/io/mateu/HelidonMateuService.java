package io.mateu;

import io.mateu.core.application.DefaultMateuService;
import io.mateu.core.application.runaction.RunActionUseCase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Default;
import jakarta.enterprise.inject.Specializes;
import jakarta.inject.Inject;

@ApplicationScoped
@Default
@Specializes
public class HelidonMateuService extends DefaultMateuService {

    @Inject
    public HelidonMateuService(RunActionUseCase runActionUseCase) {
        super(runActionUseCase);
    }
}
