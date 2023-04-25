package io.mateu.remote.dtos;

import lombok.*;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class View {

    private String title;

    private String subtitle;

    private ViewPart left;

    private ViewPart main;

    private ViewPart right;

}
