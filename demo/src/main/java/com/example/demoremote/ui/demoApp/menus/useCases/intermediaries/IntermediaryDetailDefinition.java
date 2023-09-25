package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries;

import com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.salesAgents.SalesAgentsCrud;
import com.example.demoremote.ui.demoApp.menus.useCases.leads.QuestionsProvider;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Section;
import io.mateu.mdd.shared.annotations.ValuesProvider;
import io.mateu.mdd.shared.data.ExternalReference;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;

@Getter
@Setter
public abstract class IntermediaryDetailDefinition {

  String id;

  String name;

  @Autowired SalesAgentsCrud salesAgents;

  @Section(value = "Requirements", description = "Answers provided by the lead")
  @ValuesProvider(QuestionsProvider.class)
  @Caption("")
  private List<ExternalReference> questions =
      List.of(
          new ExternalReference("1", "AVAD score"), new ExternalReference("2", "Another answer"));

  @Section(value = "Documents", description = "Provided documents")
  private List<URL> uploadedDocuments =
      List.of(new URL("https://www.google.es"), new URL("https://www.elpais.es"));

  protected IntermediaryDetailDefinition() throws MalformedURLException {}
}
