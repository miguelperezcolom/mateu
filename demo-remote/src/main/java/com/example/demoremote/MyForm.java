package com.example.demoremote;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.*;
import io.mateu.mdd.shared.interfaces.HasBadges;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@MateuUI(path = "")
@Data
public class MyForm implements HasBadges {

    private String name = "Mateu";

    private int age;

    private double balance = 20.31;

    @TextArea
    private String text = """
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel semper libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.
                        
            Proin volutpat, sapien ut facilisis ultricies, eros purus blandit velit, at ultrices mi libero quis ante. Curabitur scelerisque metus et libero convallis consequat. Pellentesque feugiat pulvinar nisl sed pellentesque.
            """;

    private LocalDate date;

    private LocalDateTime dateAndTime;

    private LocalTime time;

    private boolean check;

    @UseRadioButtons
    private Conference conference;

    private Division division;

    @ReadOnly
    private String assessment;

    @ItemsProvider(TeamsProvider.class)
    private ExternalReference yourFavouriteTeam;

    @ItemsProvider(TeamsProvider.class)
    private ExternalReference teamAtSanFrancisco = new ExternalReference("25", "San Francisco 49ers");

    @Action
    public void assess() {
        assessment = "" + name
                + ", " + age
                + ", " + balance
                + ", " + text
                + ", " + date
                + ", " + dateAndTime
                + ", " + time
                + ", " + check
                + ", " + conference
                + ", " + division
                + ", " + yourFavouriteTeam
                + ", " + teamAtSanFrancisco
        ;
    }

    public String toString() {
        return "This is a sample form";
    }

    @Override
    public List<Badge> getBadges() {
        return List.of(new Badge(BadgeType.SUCCESS, "It works!"));
    }
}
