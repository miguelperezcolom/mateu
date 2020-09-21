package io.mateu.mdd.lifecycle;

import com.google.auto.service.AutoService;

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

                System.out.println("AppListenerAnnotationProcessor running on " + simpleClassName);

                String generatedFullClassName = className + "Impl";
                String pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
                String generatedClassName = generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);

                JavaFileObject builderFile = null;
                try {
                    builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "Wrapper");
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …


                        out.println("package " + pkgName + ";");
                        out.println("import " + className + ";");

                        out.println("import com.google.auto.service.AutoService;");
                        out.println("import io.mateu.mdd.shared.AppContextListener;");

                        out.println("");

                        out.println("@AutoService(AppContextListener.class)");
                        out.println("public class " + simpleClassName + "Wrapper extends " + simpleClassName + " implements AppContextListener {");
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
