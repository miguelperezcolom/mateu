package io.mateu.demo.localtool;

import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Help;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import jakarta.inject.Inject;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * Converts CSV to JSON — pasted, or read from a file on this machine and written back next to it.
 * The local files are the point of a local tool: no upload, nothing leaves the machine.
 */
@Title("CSV to JSON")
@Getter
@Setter
public class CsvToJson {

  @Inject ToolFolder folder;

  @Label("CSV file")
  @Help("A path on this machine, relative to the tool's folder or absolute. Or paste the CSV below.")
  String file;

  @Label("CSV")
  @Stereotype(FieldStereotype.textarea)
  String csv;

  @Label("JSON")
  @Stereotype(FieldStereotype.textarea)
  @ReadOnly
  String json;

  /** Converts the pasted CSV; with nothing pasted, reads the file first. */
  @Button
  @Label("Convert")
  public State convert() throws IOException {
    if (csv == null || csv.isBlank()) {
      csv = Files.readString(source(), StandardCharsets.UTF_8);
    }
    json = Csv.toJson(csv);
    return new State(this);
  }

  @Button
  @Label("Save next to the file")
  public List<Object> save() throws IOException {
    var source = source();
    convert();
    var name = source.getFileName().toString().replaceFirst("(?i)\\.csv$", "") + ".json";
    var target = source.resolveSibling(name);
    Files.writeString(target, json, StandardCharsets.UTF_8);
    return List.of(new State(this), Message.success("Written " + target));
  }

  private Path source() {
    if (file == null || file.isBlank()) {
      throw new UserFacingException("Which file?", "Type the path of a CSV file, or paste the CSV.");
    }
    var path = folder.path().resolve(file.trim()).normalize();
    if (!Files.isRegularFile(path)) {
      throw new UserFacingException("File not found", path.toString());
    }
    return path;
  }
}
