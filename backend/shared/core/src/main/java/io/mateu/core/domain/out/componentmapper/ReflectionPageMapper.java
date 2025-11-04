package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.HttpRequest;

public class ReflectionPageMapper {

    public static Form mapToFormComponent(
            Object instance,
            String baseUrl,
            String route,
            String initiatorComponentId,
            HttpRequest httpRequest
    ) {
        return Form.builder().build();
    }

}
