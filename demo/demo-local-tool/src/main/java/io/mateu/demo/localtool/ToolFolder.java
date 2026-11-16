package io.mateu.demo.localtool;

import java.nio.file.Path;
import org.springframework.boot.ApplicationArguments;
import org.springframework.stereotype.Component;

/**
 * The folder the tool works on: the command's first argument, else the directory it was run in.
 */
@Component
public class ToolFolder {

  private final Path path;

  public ToolFolder(ApplicationArguments arguments) {
    var given = arguments.getNonOptionArgs();
    this.path =
        Path.of(given.isEmpty() ? System.getProperty("user.dir") : given.get(0))
            .toAbsolutePath()
            .normalize();
  }

  public Path path() {
    return path;
  }
}
