package io.mateu.mdd.annotationProcessing;

import com.google.auto.service.AutoService;
import io.mateu.mdd.core.annotations.MateuUIServlet;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;

@SupportedAnnotationTypes({"io.mateu.mdd.core.annotations.MateuUIServlet"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
public class MateuUIServletAnnotationProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (TypeElement annotation : annotations) {
            Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

            for (Element e : annotatedElements) {
                String className = ((TypeElement) e).getQualifiedName().toString();
                String simpleClassName = ((TypeElement) e).getSimpleName().toString();

                System.out.println("MateuUIServletAnnotationProcessor running on " + simpleClassName);

                String generatedFullClassName = className;
                String pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
                String generatedClassName = generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);

                JavaFileObject builderFile = null;
                try {
                    builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "Bean");
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …

                        out.println("package " + pkgName + ";");
                        out.println("import " + className + ";");

                        out.println("import io.mateu.mdd.vaadin.MDDUI;");
                        out.println("import org.springframework.boot.web.servlet.ServletRegistrationBean;");
                        out.println("import org.springframework.stereotype.Service;");

                        out.println("");


                        out.println();
                        out.println("@Service");
                        out.println("public class " + simpleClassName + "Bean extends ServletRegistrationBean {");
                        out.println("");
                        out.println("    public " + simpleClassName + "Bean() {");
                        out.println("        super(new " + simpleClassName + "(), \"" + e.getAnnotation(MateuUIServlet.class).path() + "\", \"" + ("/".equals(e.getAnnotation(MateuUIServlet.class).path())?"":e.getAnnotation(MateuUIServlet.class).path()) + "/*\");");
                        out.println("    }");
                        out.println("");
                        out.println("}");
                    }

                } catch (IOException ex) {
                    ex.printStackTrace();
                }


            }
        }

        return true;
    }
}
