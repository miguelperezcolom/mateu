package org.example.uimodules;

import io.mateu.EnableMateuUiModules;
import io.mateu.thirdparty.ui.ThirdPartyHome;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** An app mounting the third-party module by annotation (type-safe, by one of its classes). */
@SpringBootApplication
@EnableMateuUiModules(basePackageClasses = ThirdPartyHome.class)
public class ModulesApp {}
