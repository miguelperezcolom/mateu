package com.example.demo.infra.ui.menus.useCases.intermediaries;

import com.example.demo.infra.ui.menus.useCases.intermediaries.salesAgents.SalesAgentsCrud;
import com.example.demo.infra.ui.menus.useCases.leads.QuestionsProvider;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.ValuesProvider;
import io.mateu.uidl.data.ExternalReference;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

@Getter
@Setter
public abstract class IntermediaryDetailDefinition {

  String id;

  String name;

  @Autowired
  SalesAgentsCrud salesAgents;

  @Section(value = "Requirements", description = "Answers provided by the lead")
  @ValuesProvider(QuestionsProvider.class)
  @Label("")
  private List<ExternalReference> questions =
      List.of(
          new ExternalReference("1", "AVAD score"), new ExternalReference("2", "Another answer"));

  @Section(value = "Documents", description = "Provided documents")
  private List<URL> uploadedDocuments =
      List.of(new URL("https://www.google.es"), new URL("https://www.elpais.es"));

  protected IntermediaryDetailDefinition() throws MalformedURLException {}
}
