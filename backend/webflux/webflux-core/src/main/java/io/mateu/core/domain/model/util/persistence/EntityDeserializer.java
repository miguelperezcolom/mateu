package io.mateu.core.domain.model.util.persistence;

import jakarta.persistence.EntityManager;

public interface EntityDeserializer {

  <T> T fromJson(EntityManager em, String json, Class<T> c) throws Exception;
}
