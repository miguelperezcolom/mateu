package io.mateu.mdd.demoadminpanel.infra.in.ui.filelist;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FileItem;
import io.mateu.uidl.data.FileList;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link FileList} component: an attachment list. */
@UI("/filelist-demo")
@Title("Attachments")
public class Attachments {

  @Section("Files")
  Component files =
      FileList.builder()
          .files(
              List.of(
                  FileItem.builder().name("Q3-report.pdf").size("2.4 MB").type("pdf").url("#").build(),
                  FileItem.builder().name("brand-logo.png").size("120 KB").type("image").url("#").build(),
                  FileItem.builder().name("budget.xlsx").size("48 KB").type("excel").url("#").build(),
                  FileItem.builder().name("contract.docx").size("310 KB").type("word").url("#").build(),
                  FileItem.builder().name("assets.zip").size("18.2 MB").type("zip").url("#").build(),
                  FileItem.builder().name("demo.mp4").size("64 MB").type("video").actionId("preview").build()))
          .build();
}
