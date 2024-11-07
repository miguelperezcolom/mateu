package com.example.demo.infra.ui.menus.refs;

import io.mateu.uidl.core.annotations.File;
import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.Caption;
import io.mateu.uidl.core.annotations.ReadOnly;
import io.mateu.uidl.core.annotations.Section;
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
