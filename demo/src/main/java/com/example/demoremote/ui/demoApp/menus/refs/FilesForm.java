package com.example.demoremote.ui.demoApp.menus.refs;

import io.mateu.mdd.shared.annotations.*;
import java.io.File;
import java.util.List;
import lombok.Data;

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
