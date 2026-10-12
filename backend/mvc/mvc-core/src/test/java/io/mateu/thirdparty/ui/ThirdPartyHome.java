package io.mateu.thirdparty.ui;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * Stands for the console of a third-party Mateu UI module (a workflow engine's, say): a {@code @UI}
 * whose generated controller and route resolver land in THIS package, which the test applications
 * do not scan. It is served only when the application names the package ({@code mateu.ui.modules}
 * or {@code @EnableMateuUiModules}).
 */
@UI("/thirdparty")
@Title("Third-party module")
public class ThirdPartyHome {

  String note = "served from a module the application named";
}
