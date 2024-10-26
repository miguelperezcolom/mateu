package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.ReadOnly;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.RichText;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Section;
import lombok.Data;

@Data
public class RichTextFieldForm {

  @Section("Basic")
  // @NotEmpty
  @RichText
  // @Placeholder("This should appear as the placeholder")
  private String text =
      """
{"counters":{"u_column":1,"u_row":1},"body":{"id":"k8UkSN_YOh","rows":[{"id":"RVSLGk4TgT","cells":[1],"columns":[{"id":"mYG6FhwmeS","contents":[],"values":{"backgroundColor":"","padding":"0px","border":{},"_meta":{"htmlID":"u_column_1","htmlClassNames":"u_column"}}}],"values":{"displayCondition":null,"columns":false,"backgroundColor":"","columnsBackgroundColor":"","backgroundImage":{"url":"","fullWidth":true,"repeat":"no-repeat","size":"custom","position":"center"},"padding":"0px","anchor":"","hideDesktop":false,"_meta":{"htmlID":"u_row_1","htmlClassNames":"u_row"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"hideable":true}}],"values":{"popupPosition":"center","popupWidth":"600px","popupHeight":"auto","borderRadius":"10px","contentAlign":"center","contentVerticalAlign":"center","contentWidth":"500px","fontFamily":{"label":"Arial","value":"arial,helvetica,sans-serif"},"textColor":"#000000","popupBackgroundColor":"#FFFFFF","popupBackgroundImage":{"url":"","fullWidth":true,"repeat":"no-repeat","size":"cover","position":"center"},"popupOverlay_backgroundColor":"rgba(0, 0, 0, 0.1)","popupCloseButton_position":"top-right","popupCloseButton_backgroundColor":"#DDDDDD","popupCloseButton_iconColor":"#000000","popupCloseButton_borderRadius":"0px","popupCloseButton_margin":"0px","popupCloseButton_action":{"name":"close_popup","attrs":{"onClick":"document.querySelector('.u-popup-container').style.display = 'none';"}},"backgroundColor":"#e7e7e7","backgroundImage":{"url":"","fullWidth":true,"repeat":"no-repeat","size":"custom","position":"center"},"preheaderText":"","linkStyle":{"body":true,"linkColor":"#0000ee","linkHoverColor":"#0000ee","linkUnderline":true,"linkHoverUnderline":true},"_meta":{"htmlID":"u_body","htmlClassNames":"u_body"}}},"schemaVersion":15}
            """;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + "" + text;
  }

  public String toString() {
    return "Text";
  }
}
