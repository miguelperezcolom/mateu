package com.example.demo.infra.ui.menus.forms;

import io.mateu.mdd.shared.annotations.*;
import lombok.Data;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@Data
@Caption("Call action on file upload")
public class CallActionOnFileUploadForm {

  public CallActionOnFileUploadForm() throws MalformedURLException {}

  @Section("Basic")
  @ReadOnly
  private List<URL> uploadedDocuments = new ArrayList(List.of(new URL("https://www.google.es")));

  @File
  @CallActionOnChange("assess")
  private List<String> uploadFile = new ArrayList<>();

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + uploadedDocuments + ", " + uploadFile;
  }
}
