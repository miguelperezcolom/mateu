package io.mateu.mdd.annotationProcessing;

import com.google.auto.service.AutoService;
import com.sun.source.tree.BlockTree;
import com.sun.source.tree.MethodTree;
import com.sun.source.tree.StatementTree;
import com.sun.source.tree.Tree;
import com.sun.source.util.Trees;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.*;
import javax.lang.model.util.ElementFilter;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.invoke.MethodType;
import java.util.Collections;
import java.util.Set;

@SupportedAnnotationTypes({"javax.persistence.Entity", "lombok.MateuMDDEntity"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
public class EntityAnnotationProcessor extends AbstractProcessor {

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
                    builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "Pojo");
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …


                        out.println("package " + pkgName + ";");
                        out.println("import " + className + ";");
                        out.println("");
                        out.println("import io.mateu.mdd.core.interfaces.PersistentPojo;");
                        out.println("import java.io.IOException;");
                        out.println("import io.mateu.mdd.core.reflection.ReflectionHelper;");
                        out.println("import io.mateu.mdd.util.JPAHelper;");
                        out.println("import io.mateu.mdd.core.annotations.Ignored;");
                        out.println("import " + className + ";");
                        out.println("");

                        printImports(out, roundEnv, e);

                        out.println("");

                        out.println("public class " + simpleClassName + "Pojo implements PersistentPojo {");

                        out.println("");
                        out.println("    @Ignored");
                        out.println("    private Class _type = " + simpleClassName + ".class;");
                        out.println("    @Ignored");
                        out.println("    private Object _id;");
                        out.println("");

                        printPojoConstructor(out, e);

                        out.println("");

                        printPojoBody(out, e);

                        out.println("");

                        printPojoLoad(out, e);

                        out.println("");

                        printPojoSave(out, e);

                        out.println("");

                        printPojoGetId(out, e);

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

    private void printImports(PrintWriter out, RoundEnvironment roundEnv, Element e) {
        ImportScanner scanner = new ImportScanner();
        scanner.scan(roundEnv.getRootElements(), null);

        Set<String> importedTypes = scanner.getImportedTypes();
        for (String importedType : importedTypes) {
            if (!importedType.contains("<") && !importedType.contains("@") && !importedType.equals("none")
            && !importedType.startsWith("java.lang.")) out.println("import " + importedType + ";");
        }
    }

    private void printPojoGetId(PrintWriter out, Element e) {
        out.println("    @Override");
        out.println("    public Object getId() {");
        out.println("        return _id;");
        out.println("    }");
    }

    private void printPojoSave(PrintWriter out, Element e) {
        out.println("    @Override");
        out.println("    public void save() throws IOException, Throwable {");
        out.println("        JPAHelper.transact(em -> {");
        out.println("            Object o = em.find(_type, _id);");
        out.println("            ReflectionHelper.copy(this, o);");
        out.println("        });");
        out.println("    }");
    }

    private void printPojoLoad(PrintWriter out, Element e) {
        out.println("    @Override");
        out.println("    public void load(Object id) throws Throwable {");
        out.println("        this._id = id;");
        out.println("        Object o = JPAHelper.find(_type, _id);");
        out.println("        ReflectionHelper.copy(o, this);");
        out.println("    }");
    }

    private void printPojoConstructor(PrintWriter out, Element e) {
        String simpleClassName = ((TypeElement) e).getSimpleName().toString();

        out.println("    public " + simpleClassName + "Pojo() {");
        out.println("    }");
    }

    private void printPojoBody(PrintWriter out, Element e) {

        printPojoAttributes(out, e);

        printPojoActions(out, e);

    }

    private void printPojoActions(PrintWriter out, Element e) {
        //todo: copiar métodos (todos?)
        /*
        - recupera instancia
        - lláma al método sobre esa instancia
        - recarga la pantalla
         */
        e.getEnclosedElements().stream()
                .filter(i -> ElementKind.METHOD.equals(i.getKind()))
                .filter(i -> isAnnotatedWithAction(i))
                .forEach(i -> {
                    out.println(getSource(i));
                });
    }

    private boolean isAnnotatedWithAction(Element e) {
        boolean tieneAction = false;
        for (AnnotationMirror m : e.getAnnotationMirrors()) {
            tieneAction = "io.mateu.mdd.core.annotations.Action".equals(m.getAnnotationType().toString());
            if (tieneAction) break;
        }
        return tieneAction;
    }

    private void printPojoAttributes(PrintWriter out, Element e) {
        //todo: todos?

        e.getEnclosedElements().stream()
                .filter(i -> ElementKind.FIELD.equals(i.getKind()))
                .forEach(i -> {
            out.println(getSource(i));
        });

    }

    private String getSource(Element e) {
        Trees trees = Trees.instance(processingEnv);
        Tree tree = trees.getTree(e);
        if (tree != null) {
            return tabular(tree.toString()) + ";";
        }
        return "";
    }

    private String tabular(String s) {
        String r = "";
        for (String t : s.split("\\n")) {
            if (!"".equals(r)) r += "\n";
            r += "    " + t;
        }
        return r;
    }


    private String getMethodSource(Element e) {
        Trees trees = Trees.instance(processingEnv);

        String s = "";
        MethodTree methodTree = (MethodTree) trees.getTree(e);
        if (methodTree != null) {
            BlockTree blockTree = methodTree.getBody();
            if (blockTree != null) {
                for (StatementTree statementTree : blockTree.getStatements()) {
                    // *do something with the statements*
                    s += statementTree.toString();
                }
            }
        }
        return s;
    }

}
