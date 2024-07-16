package com.example.demo.infra.ui.menus.refs;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.mdd.shared.annotations.Section;
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
  @io.mateu.mdd.shared.annotations.File
  private String singleFileAsString;

  @io.mateu.mdd.shared.annotations.File private List<String> filesAsStrings;

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
