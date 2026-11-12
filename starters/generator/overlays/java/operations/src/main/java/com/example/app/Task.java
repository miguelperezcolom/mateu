package com.example.app;

import java.time.LocalDate;

/** A piece of work: on the board it is a card in its stage's column, on the schedule an event. */
public record Task(String id, String title, String assignee, Stage stage, LocalDate due, boolean urgent) {

  public enum Stage {
    Todo,
    Doing,
    Done
  }

  public Task movedTo(Stage to) {
    return new Task(id, title, assignee, to, due, urgent);
  }
}
