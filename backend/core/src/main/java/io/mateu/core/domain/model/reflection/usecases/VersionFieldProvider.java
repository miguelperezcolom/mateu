package io.mateu.core.domain.model.reflection.usecases;

import jakarta.persistence.Entity;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;
import java.lang.reflect.Field;
import org.springframework.stereotype.Service;

@Service
public class VersionFieldProvider {

  public Field getVersionField(Class c) {
    if (c.isAnnotationPresent(Entity.class)) {
      Field idField = null;

      if (c.getSuperclass() != null
          && (!c.isAnnotationPresent(Entity.class)
              || c.getSuperclass().isAnnotationPresent(Entity.class)
              || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class))) {
        idField = getVersionField(c.getSuperclass());
      }

      if (idField == null) {
        for (Field f : c.getDeclaredFields())
          if (f.isAnnotationPresent(Version.class)) {
            idField = f;
          }
      }

      return idField;
    } else return null;
  }
}
