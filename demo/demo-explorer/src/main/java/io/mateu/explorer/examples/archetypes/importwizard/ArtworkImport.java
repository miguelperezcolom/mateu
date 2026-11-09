package io.mateu.explorer.examples.archetypes.importwizard;

import io.mateu.core.infra.declarative.orchestrators.importwizard.ImportWizard;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

/**
 * The {@code ImportWizard} archetype: upload or paste a CSV, check the auto-mapping of its columns
 * onto the row class, read the validation report, import the valid rows. You write the row class
 * and {@link #importRows}; try pasting:
 *
 * <pre>
 * title,artist,year
 * Water Lilies,Claude Monet,1906
 * ,Unknown,1500
 * The Great Wave,Hokusai,1831
 * </pre>
 */
@Title("Import artworks")
public class ArtworkImport extends ImportWizard<ArtworkImport.Artwork> {

  public static class Artwork {
    @NotEmpty public String title;
    public String artist;
    public int year;
  }

  static final List<Artwork> IMPORTED = new ArrayList<>();

  @Override
  protected void importRows(List<Artwork> rows, HttpRequest httpRequest) {
    IMPORTED.addAll(rows);
  }
}
