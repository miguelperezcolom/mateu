package io.mateu.core.domain.util.persistence;

import java.util.Map;

public interface EntitySerializer {

  Map<String, Object> toMap(Object entity) throws Exception;
}
