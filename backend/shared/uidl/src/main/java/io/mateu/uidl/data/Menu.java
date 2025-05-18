package io.mateu.uidl.data;


import java.util.List;

public record Menu(String label, GoToRoute destination, List<Menu> submenu, boolean selected) {
}
