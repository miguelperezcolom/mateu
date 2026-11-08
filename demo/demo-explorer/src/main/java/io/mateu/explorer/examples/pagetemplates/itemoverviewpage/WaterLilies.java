package io.mateu.explorer.examples.pagetemplates.itemoverviewpage;

/**
 * The record behind the YAML item-overview page: the route binds the layout ({@code
 * item-overview-page.yaml}) to this view model, whose fields are the page's {@code state} — what
 * {@code ${state.title}} and every {@code FormField id} read. The layout stays pure YAML.
 */
public class WaterLilies {
  public String id = "a1";
  public String title = "Water Lilies";
  public String artist = "Claude Monet";
  public String date = "1906";
  public String classification = "Painting";
  public String medium = "Oil on canvas";
  public String dimensions = "89.9 × 94.1 cm";
  public String museum = "The Met";
  public String gallery = "On loan to SMK";
  public String creditLine = "Bequest of Mrs. H. O. Havemeyer, 1929";
  public String description =
      "One of some 250 paintings of the lily pond at Giverny. The horizon has gone: only water,"
          + " reflected sky and the flowers remain.";
  public String image = "https://images.metmuseum.org/CRDImages/ep/mobile-large/DT47.jpg";
}
