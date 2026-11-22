package com.example.app;
import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped
public class Greetings { public String greet(String name) { return "Hello " + name + "!"; } }
