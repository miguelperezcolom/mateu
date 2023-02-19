package io.mateu.remote.dtos;

import lombok.*;

import java.util.List;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class UI {

    private String title;

    private String subtitle;

    private List<Menu> menu;

    private View home;

}
