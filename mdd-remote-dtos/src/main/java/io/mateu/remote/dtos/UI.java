package io.mateu.remote.dtos;

import lombok.Data;

import java.util.List;

@Data
public class UI {

    private String title;

    private String subtitle;

    private List<Menu> menu;

    private View home;

}
