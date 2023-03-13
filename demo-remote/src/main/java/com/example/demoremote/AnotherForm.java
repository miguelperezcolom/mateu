package com.example.demoremote;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.Badge;
import io.mateu.mdd.shared.data.BadgeType;
import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.interfaces.HasBadges;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@MateuUI(path = "anotherform")
@Data
@Caption("This is another form")
public class AnotherForm {

    private String name = "Mateu";

    @ItemsProvider(TeamsProvider.class)
    private ExternalReference yourFavouriteTeam;

    @ItemsProvider(TeamsProvider.class)
    private ExternalReference teamAtSanFrancisco = new ExternalReference("25", "San Francisco 49ers");

    @ReadOnly
    private String assessment;


    @Action
    public void assess() {
        assessment = "" + name
                + ", " + yourFavouriteTeam
                + ", " + teamAtSanFrancisco
        ;
    }

}
