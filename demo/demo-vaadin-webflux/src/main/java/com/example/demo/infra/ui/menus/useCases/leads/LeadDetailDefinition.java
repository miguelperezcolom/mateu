package com.example.demo.infra.ui.menus.useCases.leads;

import io.mateu.uidl.core.annotations.*;
import io.mateu.uidl.core.data.TelephoneNumber;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Getter
@Setter
public abstract class LeadDetailDefinition {

  String id;

  String name;

  TelephoneNumber homeTelephone;

  TelephoneNumber workTelephone;

  @Section(
      value = "Requirements",
      description = "Please provide answers for the following questions")
  @ValuesProvider(QuestionsProvider.class)
  @Caption("")
  @CallActionOnChange("questionsUpdated")
  private List<String> questions = List.of("1");

  @Section(
      value = "Document upload",
      description =
          "Please upload the additional documents for the related intermediary. "
              + "The documents may provide information about intermediary background, licenses, training hours, etc. "
              + "Please keep in mind that up to five files can be uploaded (png, jpg or pdf).")
  private List<URL> uploadedDocuments = new ArrayList(List.of(new URL("https://www.google.es")));

  @File
  @CallActionOnChange("filesUploaded")
  private List<String> uploadFile = new ArrayList<>();

  protected LeadDetailDefinition() throws MalformedURLException {}

  @Action(visible = false)
  public void questionsUpdated() {
    log.info("questions updated");
  }

  @Action(visible = false)
  public void filesUploaded() {
    log.info("files uploaded");
    uploadFile.forEach(
        s -> {
          try {
            log.info("adding " + s + " to the uploaded files list");
            uploadedDocuments.add(new URL(s));
          } catch (MalformedURLException e) {
            e.printStackTrace();
          }
        });
  }

  @Action
  public void approve() {
    log.info("approved");
  }

  @Action
  public void reject() {
    log.info("rejected");
  }
}
