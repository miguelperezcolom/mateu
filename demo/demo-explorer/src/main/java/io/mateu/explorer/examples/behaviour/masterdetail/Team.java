package io.mateu.explorer.examples.behaviour.masterdetail;

import java.util.List;

/** The data both islands read. */
public final class Team {

  public record TeamMember(String id, String name, String role, String bio) {}

  public static final List<TeamMember> MEMBERS =
      List.of(
          new TeamMember("1", "Ada Lovelace", "Analyst", "Wrote the first published algorithm."),
          new TeamMember("2", "Alan Turing", "Architect", "Asked whether machines can think."),
          new TeamMember("3", "Grace Hopper", "Compiler lead", "Made code readable by people."),
          new TeamMember("4", "Margaret Hamilton", "Flight software", "Coined software engineering."),
          new TeamMember("5", "Barbara Liskov", "Design", "Substitutability, by her name."));

  private Team() {}
}
