package io.mateu.mdd.annotationProcessing;

import com.google.auto.service.AutoService;
import io.mateu.mdd.core.annotations.MateuMDDUI;
import io.mateu.mdd.core.annotations.Repository;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;

@SupportedAnnotationTypes({"io.mateu.mdd.core.annotations.Repository"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
public class RepositoryAnnotationProcessor extends AbstractProcessor {

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
                    builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "Impl");
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …

                        out.println("package " + pkgName + ";");
                        out.println("import " + className + ";");

                        out.println("import lombok.extern.slf4j.Slf4j;");

                        out.println("import io.mateu.test.model.Entidad;");
                        out.println("import java.util.List;");
                        out.println("import javax.persistence.EntityManager;");

                        out.println("");

                        out.println();
                        out.println("public class " + simpleClassName + "Impl implements " + simpleClassName + " {");
                        out.println("");
                        out.println("    private EntityManager em;");
                        out.println("");
                        out.println("    public " + simpleClassName + "Impl(EntityManager em) { this.em = em; }");
                        out.println("");
                        out.println("    @Override\n" +
                                "    public Entidad find(Long id) {\n" +
                                "        return null;\n" +
                                "    }\n" +
                                "\n" +
                                "    @Override\n" +
                                "    public List<Entidad> findAll() {\n" +
                                "        return null;\n" +
                                "    }\n" +
                                "\n" +
                                "    @Override\n" +
                                "    public Entidad save(Entidad object) {\n" +
                                "        return null;\n" +
                                "    }\n" +
                                "\n" +
                                "    @Override\n" +
                                "    public void remove(Entidad object) {\n" +
                                "\n" +
                                "    }\n");
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
