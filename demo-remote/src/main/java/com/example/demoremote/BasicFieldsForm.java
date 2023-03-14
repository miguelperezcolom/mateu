package com.example.demoremote;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.*;
import io.mateu.mdd.shared.interfaces.HasBadges;
import lombok.Data;

import java.net.URL;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
public class BasicFieldsForm implements HasBadges {

    @Section("Basic")
    private String name = "Mateu";

    private int age;

    private double balance = 20.31;

    @TextArea
    private String text = """
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel semper libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.
                        
            Proin volutpat, sapien ut facilisis ultricies, eros purus blandit velit, at ultrices mi libero quis ante. Curabitur scelerisque metus et libero convallis consequat. Pellentesque feugiat pulvinar nisl sed pellentesque.
            """;

    @Section("Dates")
    private LocalDate date;

    private LocalDateTime dateAndTime;

    private LocalTime time;

    @Section("Checks")
    private boolean check;

    @Toggle
    private boolean toggle;

    @Section("Enums")
    @UseRadioButtons
    private Conference conference;

    private Division division;


    @Section("Assessment")
    @ReadOnly
    private String assessment;

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
        ;
    }

    public String toString() {
        return "This is a sample form";
    }

    @Override
    public List<Badge> getBadges() {
        return List.of(new Badge(BadgeType.WARNING, "It works!"));
    }
}
