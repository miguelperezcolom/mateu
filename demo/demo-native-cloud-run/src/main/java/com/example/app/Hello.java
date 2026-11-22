package com.example.app;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import jakarta.inject.Inject;
@Title("Hello")
public class Hello {
  @Inject Greetings greetings;
  String name;
  @Button
  Message greet() { return Message.success(greetings.greet(name)); }
}
