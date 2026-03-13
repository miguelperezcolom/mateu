package com.example.demo.infra.in.ui.pages.processes;


import io.mateu.uidl.interfaces.Named;

public record Message(String processId, String id, String name) implements Named {
}
