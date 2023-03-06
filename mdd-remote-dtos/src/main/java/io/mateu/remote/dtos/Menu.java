package io.mateu.remote.dtos;

import lombok.*;

import java.util.List;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Menu {

    private MenuType type;

    private String caption;

    private String journeyTypeId;

    private List<Menu> submenus;

}
