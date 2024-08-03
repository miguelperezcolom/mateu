package io.mateu.core.domain.model.outbound.modelToDtoMappers;

public interface EntityProvider {

  Object find(Class type, Object id);
}
