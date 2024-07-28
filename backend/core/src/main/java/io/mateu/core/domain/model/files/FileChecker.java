package io.mateu.core.domain.model.files;

import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.annotations.File;
import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FileChecker {

  final ReflectionHelper reflectionHelper;

  public boolean isFile(FieldInterfaced field) {
    return java.io.File.class.equals(field.getType())
        || java.io.File[].class.equals(field.getType())
        || java.io.File.class.equals(reflectionHelper.getGenericClass(field, List.class, "E"))
        || field.isAnnotationPresent(File.class);
  }
}
