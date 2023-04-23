package com.example.demoremote.ui.demoApp.menus.forms;

import com.example.demoremote.domains.nfl.dtos.Conference;
import com.example.demoremote.domains.nfl.dtos.Division;
import io.mateu.mdd.core.interfaces.HasSubtitle;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.*;
import io.mateu.mdd.shared.interfaces.HasBadges;
import io.mateu.mdd.shared.interfaces.HasStatus;
import io.mateu.mdd.shared.interfaces.MateuSecurityManager;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.util.Helper;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
public class BasicFieldsForm implements HasBadges, HasStatus, HasTitle, HasSubtitle {

    @Section("Basic")
    @NotEmpty
    private String name = "Mateu";

    @Placeholder("This should appear as the placeholder")
    private String withPlaceholder;

    @NotNull
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

    @UseRadioButtons
    private boolean usingRadioButtons;

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
        assessment = "" + getCurrentUser()
                + "" + name
                + ", " + toggle
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

    private String getCurrentUser() {
        try {
            UserPrincipal principal = Helper.getImpl(MateuSecurityManager.class).getPrincipal();
            if (principal == null) {
                return "principal es null";
            }
            return principal.getName();
        } catch (Exception e) {
            return "" + e.getClass().getSimpleName() + ": " + e.getMessage();
        }
    }

    public String toString() {
        return "This is a sample form (toString)";
    }

    @Override
    public List<Badge> getBadges() {
        return List.of(new Badge(BadgeType.WARNING, "It works!"));
    }

    @Override
    public Status getStatus() {
        return new Status(StatusType.SUCCESS, "This is the status!");
    }

    @Override
    public String getSubtitle() {
        return "This is the subtitle";
    }

    @Override
    public String getTitle() {
        return "This is the title";
    }
}
