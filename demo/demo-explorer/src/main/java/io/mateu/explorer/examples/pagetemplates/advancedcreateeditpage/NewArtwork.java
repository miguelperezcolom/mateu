package io.mateu.explorer.examples.pagetemplates.advancedcreateeditpage;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.data.Message;

/**
 * The form behind the YAML advanced create/edit page: the layout's {@code FormField}s edit these
 * fields, and its primary button ({@code actionId: save}) runs {@link #save}.
 */
public class NewArtwork {
  public String title;
  public String artist;
  public Integer year;
  public String classification;
  public String medium;
  public String dimensions;
  public String creditLine;

  @Action(validationRequired = true)
  public Message save() {
    return Message.success("Saved “" + title + "” by " + artist);
  }
}
