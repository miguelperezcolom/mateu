package com.example.demoremote.ui;

import com.example.demoremote.nfl.dtos.Conference;
import com.example.demoremote.nfl.dtos.Division;
import com.example.demoremote.rpcCruds.ProgrammingLanguages;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.Badge;
import io.mateu.mdd.shared.data.BadgeType;
import io.mateu.mdd.shared.data.Status;
import io.mateu.mdd.shared.data.StatusType;
import io.mateu.mdd.shared.interfaces.HasBadges;
import io.mateu.mdd.shared.interfaces.HasStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
public class MyReadOnlyPojoWithCrud implements io.mateu.mdd.core.interfaces.ReadOnlyPojo, HasBadges, HasStatus {

    @Section("Basic")
    private String name = "Mateu";

    @Placeholder("This should appear as the placeholder")
    private String withPlaceholder;

    private int age;

    private double balance = 20.31;

    private ProgrammingLanguages programmingLanguages;

    @Section("Assessment")
    @ReadOnly
    private String assessment;

    @Action
    public void assess() {
        assessment = "" + name
                + ", " + age
                + ", " + balance
        ;
    }

    public String toString() {
        return "This is a sample form (from toString)";
    }

    @Override
    public List<Badge> getBadges() {
        return List.of(new Badge(BadgeType.WARNING, "It works!"));
    }

    @Override
    public void load(Object id) throws Throwable {

    }

    @Override
    public Object getId() {
        return "010100101";
    }

    @Override
    public Status getStatus() {
        return new Status(StatusType.SUCCESS, "This is the status!");
    }

}
