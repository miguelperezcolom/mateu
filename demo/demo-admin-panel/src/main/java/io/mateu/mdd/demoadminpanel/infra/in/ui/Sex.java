package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Icon;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.interfaces.IconKey;

public enum Sex {
    @Label("H")
            @Icon(IconKey.Male)
    Male,
    @Label("M")
            @Icon(IconKey.Female)
    Female
}
