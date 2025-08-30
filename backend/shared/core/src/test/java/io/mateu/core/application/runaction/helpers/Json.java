package io.mateu.core.application.runaction.helpers;

import java.nio.file.Files;
import java.nio.file.Path;
import lombok.SneakyThrows;

public class Json {

  @SneakyThrows
  public static String readJsonFromClasspath(Class refClass, String path) {
    return String.join(
        System.lineSeparator(),
        Files.readAllLines(
            Path.of(
                refClass
                    .getResource(
                        "/" + refClass.getPackageName().replaceAll("\\.", "/") + "/" + path)
                    .toURI())));
  }
}
