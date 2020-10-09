package tests.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;

public class MyArchitectureTest {
    @Test
    public void some_architecture_rule() {
        JavaClasses importedClasses = new ClassFileImporter().importPackages("io.mateu.showcase");

        ArchRule rule = classes().that().resideInAPackage("..domain..").should().onlyBeAccessed().byAnyPackage("..domain..");

        //rule.check(importedClasses);
    }
}