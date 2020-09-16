package io.mateu.mdd.annotationProcessing;

import com.google.auto.service.AutoService;
import io.mateu.mdd.core.annotations.Repository;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;

@SupportedAnnotationTypes({"io.mateu.mdd.core.annotations.AppListener"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
public class AppListenerAnnotationProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (TypeElement annotation : annotations) {
            Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

            for (Element e : annotatedElements) {
                String className = ((TypeElement) e).getQualifiedName().toString();
                String simpleClassName = ((TypeElement) e).getSimpleName().toString();

                String generatedFullClassName = className + "Impl";
                String pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
                String generatedClassName = generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);

                JavaFileObject builderFile = null;
                try {
                    builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "ServletContextListener");
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …



                        out.println("package " + pkgName + ";");
                        out.println("import " + className + ";");

                        out.println("");

                        out.println("import javax.servlet.ServletContextEvent;");
                        out.println("import javax.servlet.ServletContextListener;");
                        out.println("import javax.servlet.annotation.WebListener;");

                        out.println("");

                        out.println("@WebListener\n" +
                                "public class " + simpleClassName + "ServletContextListener implements ServletContextListener {\n" +
                                "    \n");

                        out.println("    private " + simpleClassName + " app;");
                        out.println("    ");


                        out.println("    @Override\n" +
                                "    public void contextInitialized(ServletContextEvent servletContextEvent) {");

                        out.println("        app = new " + simpleClassName + "();");

                        out.println("    }\n" +
                                "\n" +
                                "    @Override\n" +
                                "    public void contextDestroyed(ServletContextEvent servletContextEvent) {");

                        out.println("        app.destroyed();");

                        out.println("    }\n" +
                                "\n" +
                                "}");
                    }
                } catch (IOException ex) {
                    ex.printStackTrace();
                }


            }
        }

        return true;
    }
}
