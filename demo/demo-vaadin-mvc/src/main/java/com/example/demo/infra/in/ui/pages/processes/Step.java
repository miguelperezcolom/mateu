package com.example.demo.infra.in.ui.pages.processes;


import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.interfaces.Named;

public record Step(@Hidden String processId, String id, String name) implements Named {
}
