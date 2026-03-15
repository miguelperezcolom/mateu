package com.example.demo.infra.in.ui.pages.processes;


import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.interfaces.Identifiable;

public record Error(@HiddenInList String processId, @HiddenInList String id, String message) implements Identifiable {
}
