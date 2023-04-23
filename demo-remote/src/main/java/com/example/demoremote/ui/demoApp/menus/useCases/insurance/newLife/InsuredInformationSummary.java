package com.example.demoremote.ui.demoApp.menus.useCases.insurance.newLife;

import io.mateu.mdd.core.interfaces.HasIcon;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.ReadOnly;
import lombok.Getter;
import lombok.Setter;


@ReadOnly@Getter@Setter
public class InsuredInformationSummary implements HasIcon, HasTitle {

    private String birthDate;

    private String smoke;

    private String occupation;

    private String sumInsured;

    private String paymentFrequency;

    @Override
    public String getIcon() {
        return "bad-life";
    }

    @Override
    public String getTitle() {
        return "Bad-life calculation";
    }
}
