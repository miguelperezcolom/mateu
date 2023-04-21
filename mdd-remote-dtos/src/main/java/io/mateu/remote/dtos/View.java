package io.mateu.remote.dtos;

import lombok.*;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class View {

    private ViewPart left;

    private ViewPart main;

    private ViewPart right;

}
