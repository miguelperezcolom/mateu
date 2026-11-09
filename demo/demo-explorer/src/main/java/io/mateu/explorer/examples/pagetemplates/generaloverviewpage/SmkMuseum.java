package io.mateu.explorer.examples.pagetemplates.generaloverviewpage;

/**
 * The record behind the YAML general-overview page: its fields are the page's {@code state}
 * ({@code ${state.name}}, the {@code FormField}s). The layout is pure YAML.
 */
public class SmkMuseum {
  public String name = "SMK — Statens Museum for Kunst";
  public String city = "Copenhagen";
  public String country = "Denmark";
  public int founded = 1896;
  public int works = 640;
  public int departments = 4;
  public String director = "Mikkel Bogh";
  public String website = "https://open.smk.dk";
  public String description =
      "The National Gallery of Denmark: the Danish Golden Age, Dutch masters, prints and drawings"
          + " and the royal cast collection.";
}
