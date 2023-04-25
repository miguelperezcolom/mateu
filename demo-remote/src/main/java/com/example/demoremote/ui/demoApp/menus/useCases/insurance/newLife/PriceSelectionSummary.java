package com.example.demoremote.ui.demoApp.menus.useCases.insurance.newLife;

import io.mateu.mdd.core.interfaces.Card;
import io.mateu.mdd.core.interfaces.HasIcon;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.ReadOnly;
import lombok.Getter;
import lombok.Setter;


@ReadOnly@Getter@Setter
public class PriceSelectionSummary extends InsuredInformationSummary implements Card, HasIcon, HasTitle {

    private String carrier;

    private String total;

}
