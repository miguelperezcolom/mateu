package com.example.demoremote;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.Badge;
import io.mateu.mdd.shared.data.BadgeType;
import io.mateu.mdd.shared.interfaces.HasBadges;
import lombok.Data;

import java.net.URL;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
public class MiscellaneousForm implements HasBadges {

    @Section("Links")
    private URL url;

    @Link
    private String linkAsString;

    @Html
    private String htmlWithLinks;

    @Section("Assessment")
    @ReadOnly
    private String assessment;

    @Action
    public void assess() {
        assessment = "" + url
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
