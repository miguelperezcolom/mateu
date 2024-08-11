package io.mateu.dtos;

import java.util.List;

public record View(
    String title,
    String subtitle,
    List<Message> messages,
    ViewPart header,
    ViewPart left,
    ViewPart main,
    ViewPart right,
    ViewPart footer) {}
