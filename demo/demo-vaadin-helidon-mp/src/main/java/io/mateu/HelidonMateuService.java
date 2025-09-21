package io.mateu;

import io.mateu.core.application.DefaultMateuService;
import io.mateu.core.application.getui.GetUIUseCase;
import io.mateu.core.application.runaction.RunActionUseCase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Default;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@Default
public class HelidonMateuService extends DefaultMateuService {

    @Inject
    public HelidonMateuService() {
        super(null, null);
    }
}
