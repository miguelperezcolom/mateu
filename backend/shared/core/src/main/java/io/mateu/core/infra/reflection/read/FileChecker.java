package io.mateu.core.infra.reflection.read;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import java.lang.reflect.Field;
import java.util.List;

public class FileChecker {

  public static boolean isFile(Field field) {
    return java.io.File.class.equals(field.getType())
        || java.io.File[].class.equals(field.getType())
        || java.io.File.class.equals(getGenericClass(field, List.class, "E"))
    // || field.isAnnotationPresent(File.class)
    ;
  }
}
