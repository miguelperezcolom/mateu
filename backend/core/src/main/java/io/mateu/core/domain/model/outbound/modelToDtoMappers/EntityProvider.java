package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import org.springframework.stereotype.Service;

public interface EntityProvider {

    Object find(Class type, Object id);

}
