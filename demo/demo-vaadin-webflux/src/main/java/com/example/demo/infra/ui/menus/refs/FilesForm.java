package com.example.demo.infra.ui.menus.refs;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.File;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Caption;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.ReadOnly;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Section;
import lombok.Data;

import java.util.List;

@Data
@Caption("External refs and files")
public class FilesForm {

  /*
  @Section("Files (not supported yet)")
  private File singleFile;

  private File[] files;
   */

  @Section("Files using strings")
  @File
  private String singleFileAsString;

  @File
  private List<String> filesAsStrings;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment =
            //"" + singleFile + ", " + files + ", " +
                    "" + singleFileAsString + ", " + filesAsStrings;
  }
}
