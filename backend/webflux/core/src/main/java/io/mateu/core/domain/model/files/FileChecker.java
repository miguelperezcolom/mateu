package io.mateu.core.domain.model.files;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.usecases.GenericClassProvider;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.File;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class FileChecker {

  final GenericClassProvider genericClassProvider;

  public boolean isFile(Field field) {
    return java.io.File.class.equals(field.getType())
        || java.io.File[].class.equals(field.getType())
        || java.io.File.class.equals(genericClassProvider.getGenericClass(field, List.class, "E"))
        || field.isAnnotationPresent(File.class);
  }
}
