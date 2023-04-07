package io.mateu.mdd.annotationProcessing;

import com.google.auto.service.AutoService;
import freemarker.template.TemplateException;
import io.mateu.mdd.shared.annotations.ExternalScripts;
import io.mateu.mdd.shared.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Caption;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@SupportedAnnotationTypes({"io.mateu.mdd.shared.annotations.MateuUI"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
public class MateuUIAnnotationProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (TypeElement annotation : annotations) {
            Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

            for (Element e : annotatedElements) {
                String className = ((TypeElement) e).getQualifiedName().toString();
                String simpleClassName = e.getSimpleName().toString();
                String path = e.getAnnotation(MateuUI.class).value();

                System.out.println("MateuUIAnnotationProcessor running on " + simpleClassName);

                String generatedFullClassName = className + "Controller";
                String pkgName = generatedFullClassName.substring(0,
                        generatedFullClassName.lastIndexOf("."));
                String generatedClassName = generatedFullClassName.substring(
                        generatedFullClassName.lastIndexOf(".") + 1);
                String caption = getCaption(e, simpleClassName);

                try {
                    createIndexController(generatedFullClassName, pkgName, className, simpleClassName, e,
                            generatedClassName, caption, path);
                    createController(className + "RemoteMateuController", pkgName, className, simpleClassName, e,
                            generatedClassName, caption, removeTrailingSlash(path));
                    createConfig(className + "Config", pkgName, className, simpleClassName, e,
                            generatedClassName, caption, path);
                } catch (IOException ex) {
                    ex.printStackTrace();
                }


            }
        }

        return true;
    }

    private String removeTrailingSlash(String path) {
        if (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        return path;
    }

    private String getCaption(Element e, String simpleClassName) {
        if (e.getAnnotation(Caption.class) != null) {
            return e.getAnnotation(Caption.class).value();
        }
        return Helper.capitalize(simpleClassName);
    }

    private void createIndexController(String generatedFullClassName, String pkgName, String className,
                                       String simpleClassName, Element e, String generatedClassName,
                                       String caption, String path)
            throws IOException {
        JavaFileObject builderFile = processingEnv.getFiler().createSourceFile(generatedFullClassName);
        try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
            // writing generated file to out …

            String[] externalScripts = null;
            if (e.getAnnotation(ExternalScripts.class) != null) {
                externalScripts = e.getAnnotation(ExternalScripts.class).value();
            }
            if (externalScripts == null) externalScripts = new String[0];

            Formatter formatter = new Formatter("index.ftl", Map.of(
                    "pkgName", pkgName
                    , "className", className
                    , "simpleClassName", simpleClassName
                    , "generatedClassName", generatedClassName
                    , "generatedFullClassName", generatedFullClassName
                    , "caption", caption
                    , "path", path
                    , "externalScripts", externalScripts
            ));
            try {
                out.println(formatter.apply());
            } catch (TemplateException ex) {
                ex.printStackTrace();
            }

        }
    }

    private void createConfig(String generatedFullClassName, String pkgName, String className,
                                  String simpleClassName, Element e, String generatedClassName,
                                  String caption, String path)
            throws IOException {
        JavaFileObject builderFile = processingEnv.getFiler().createSourceFile(generatedFullClassName);
        try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
            // writing generated file to out …

            Formatter formatter = new Formatter("config.ftl", Map.of(
                    "pkgName", pkgName
                    , "className", className
                    , "simpleClassName", simpleClassName
                    , "generatedClassName", generatedClassName
                    , "generatedFullClassName", generatedFullClassName
                    , "caption", caption
                    , "path", path
            ));
            try {
                out.println(formatter.apply());
            } catch (TemplateException ex) {
                ex.printStackTrace();
            }

        }
    }

    private void createController(String generatedFullClassName, String pkgName, String className,
                                       String simpleClassName, Element e, String generatedClassName,
                                       String caption, String path)
            throws IOException {
        JavaFileObject builderFile = processingEnv.getFiler().createSourceFile(generatedFullClassName);
        try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
            // writing generated file to out …

            Formatter formatter = new Formatter("controller.ftl", Map.of(
                    "pkgName", pkgName
                    , "className", className
                    , "simpleClassName", simpleClassName
                    , "generatedClassName", generatedClassName
                    , "generatedFullClassName", generatedFullClassName
                    , "caption", caption
                    , "path", path
            ));
            try {
                out.println(formatter.apply());
            } catch (TemplateException ex) {
                ex.printStackTrace();
            }

        }
    }

}
