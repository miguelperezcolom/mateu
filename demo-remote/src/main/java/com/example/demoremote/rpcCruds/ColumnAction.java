package com.example.demoremote.rpcCruds;

import com.vaadin.icons.VaadinIcons;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.concurrent.Callable;

@Data@NoArgsConstructor
public class ColumnAction {

    private String name;

    public ColumnAction(String name) {
        this.name = name;
    }
}
