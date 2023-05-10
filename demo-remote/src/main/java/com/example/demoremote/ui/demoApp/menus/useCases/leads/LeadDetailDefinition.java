package com.example.demoremote.ui.demoApp.menus.useCases.leads;

import com.example.demoremote.domains.agnostic.providers.ColorsProvider;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.data.TelephoneNumber;
import lombok.Getter;
import lombok.Setter;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

@Getter@Setter
public abstract class LeadDetailDefinition {

    String id;

    String name;

    TelephoneNumber homeTelephone;

    TelephoneNumber workTelephone;


    @Section(value = "Requirements", description = "Please provide answers for the following questions")
    @ValuesProvider(QuestionsProvider.class)
    @Caption("")
    @CallActionOnChange("questionsUpdated")
    private List<ExternalReference> questions = List.of(new ExternalReference("1", "AVAD score"));


    @Section(value = "Document upload",
            description = "Please upload the additional documents for the related intermediary. " +
            "The documents may provide information about intermediary background, licenses, training hours, etc. " +
            "Please keep in mind that up to five files can be uploaded (png, jpg or pdf).")
    private List<URL> uploadedDocuments = List.of(new URL("https://www.google.es"));

    @File
    @CallActionOnChange("filesUploaded")
    private List<String> uploadFiles;

    protected LeadDetailDefinition() throws MalformedURLException {
    }

    @Action(visible = false)
    public void questionsUpdated() {

    }

    @Action(visible = false)
    public void filesUploaded() {

    }

}
