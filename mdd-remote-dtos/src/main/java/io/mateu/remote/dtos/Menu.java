package io.mateu.remote.dtos;

import lombok.Data;

import java.util.List;

@Data
public class Menu {

    private MenuType type;

    private String caption;

    private String data;

    private List<Menu> submenus;

    private List<String> roles;

    private List<String> users;

}
