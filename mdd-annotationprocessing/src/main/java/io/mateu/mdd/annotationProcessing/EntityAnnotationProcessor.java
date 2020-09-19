package io.mateu.mdd.annotationProcessing;

import com.google.auto.service.AutoService;
import com.sun.source.tree.*;
import com.sun.source.util.Trees;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.AnnotationMirror;
import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.TypeElement;
import javax.tools.FileObject;
import javax.tools.JavaFileObject;
import javax.tools.StandardLocation;
import java.io.*;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@SupportedAnnotationTypes({"javax.persistence.Entity"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
public class EntityAnnotationProcessor extends AbstractProcessor {

    public EntityAnnotationProcessor() {
    }

    public EntityAnnotationProcessor(ProcessingEnvironment processingEnv) {
        this.processingEnv = processingEnv;
    }

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        System.out.println("EntityAnnotationProcessor.process()");
        for (TypeElement annotation : annotations) if ("lombok.MateuMDDEntity".equals(annotation.toString()) || "javax.persistence.Entity".equals(annotation.toString())) {
            Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

            for (Element e : annotatedElements) {

                String className = ((TypeElement) e).getQualifiedName().toString();
                String simpleClassName = ((TypeElement) e).getSimpleName().toString();

                System.out.println("EntityAnnotationProcessor running on " + simpleClassName);


                String generatedFullClassName = className + "Impl";
                String pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
                String generatedClassName = generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);

                JavaFileObject builderFile = null;
                try {
                    builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "Pojo");
                    PrintWriter out = new PrintWriter(builderFile.openWriter());
                    // writing generated file to out …


                    out.println("package " + pkgName + ";");
                    out.println("import " + className + ";");
                    out.println("");
                    out.println("import lombok.Getter;");
                    out.println("import lombok.Setter;");
                    out.println("import io.mateu.mdd.core.interfaces.PersistentPojo;");
                    out.println("import java.io.IOException;");
                    out.println("import io.mateu.mdd.core.reflection.ReflectionHelper;");
                    out.println("import io.mateu.mdd.util.JPAHelper;");
                    out.println("import io.mateu.mdd.core.annotations.Ignored;");
                    out.println("import " + className + ";");
                    out.println("");

                    printImportsFromSourceAttempt(out, roundEnv, e);

                    out.println("");

                    //todo: copiar anotaciones que no sean MateuMDDEntity
                    out.println("@Getter@Setter");
                    out.println("public class " + simpleClassName + "Pojo implements PersistentPojo {");

                    out.println("");
                    out.println("    @Ignored");
                    out.println("    private Class _type = " + simpleClassName + ".class;");
                    out.println("    @Ignored");
                    out.println("    private " + simpleClassName + " _instance;");
                    out.println("    @Ignored");
                    out.println("    private Object _id;");
                    out.println("");

                    printPojoConstructor(out, e);

                    out.println("");

                    printPojoBody(out, e, simpleClassName);

                    out.println("");

                    printPojoLoad(out, e, simpleClassName);

                    out.println("");

                    printPojoSave(out, e, simpleClassName);

                    out.println("");

                    printPojoGetId(out, e);

                    out.println("");

                    out.println("}");

                    out.close();

                } catch (IOException ex) {
                    ex.printStackTrace();
                }

            }

        }

        return true;
    }

    private void printImportsFromSourceAttempt(PrintWriter out, RoundEnvironment roundEnv, Element e) {
        String s = "";

        try {
            FileObject resource = processingEnv.getFiler().getResource(
                    StandardLocation.SOURCE_PATH,
                    "",
                    ((TypeElement) e).getQualifiedName().toString().replaceAll("\\.", "/") + ".java");
            s = leerFichero(resource.openInputStream());
        } catch (IOException ex) {
            ex.printStackTrace();
        }

        if (s != null) for (String l : s.replaceAll("\\n", " ").split(";")) {
            l = l.trim();
            if (l.startsWith("import")) {
                out.println(l + ";");
            }
        }
    }

    private static final int BUFFER = 2048;
    public static String leerFichero(InputStream is) throws IOException {

        int count;
        byte[] data = new byte[BUFFER];
        ByteArrayOutputStream dest = new ByteArrayOutputStream();
        while ((count = is.read(data, 0, BUFFER))
                != -1) {
            dest.write(data, 0, count);
        }
        dest.flush();
        dest.close();

        return new String(dest.toByteArray());
    }

    private void printPojoGetId(PrintWriter out, Element e) {
        out.println("    @Override");
        out.println("    public Object getId() {");
        out.println("        return _id;");
        out.println("    }");
    }

    private void printPojoSave(PrintWriter out, Element e, String simpleClassName) {
        out.println("    @Override");
        out.println("    public void save() throws IOException, Throwable {");
        out.println("        JPAHelper.transact(em -> {");
        out.println("            Object o = em.find(" + simpleClassName + ".class, _id);");
        out.println("            ReflectionHelper.copy(this, o);");
        out.println("        });");
        out.println("    }");
    }

    private void printPojoLoad(PrintWriter out, Element e, String simpleClassName) {
        out.println("    @Override");
        out.println("    public void load(Object id) throws Throwable {");
        out.println("        this._id = id;");
        out.println("        _instance = JPAHelper.find(" + simpleClassName + ".class, _id);");
        out.println("        ReflectionHelper.copy(_instance, this);");
        out.println("    }");
    }

    private void printPojoConstructor(PrintWriter out, Element e) {
        String simpleClassName = ((TypeElement) e).getSimpleName().toString();

        out.println("    public " + simpleClassName + "Pojo() {");
        out.println("    }");
    }

    private void printPojoBody(PrintWriter out, Element e, String simpleClassName) {

        printPojoAttributes(out, e);

        printPojoActions(out, e, simpleClassName);

    }

    private void printPojoActions(PrintWriter out, Element e, String simpleClassName) {
        //todo: copiar métodos (todos?)
        /*
        - recupera instancia
        - lláma al método sobre esa instancia
        - recarga la pantalla
         */
        for (Element i : e.getEnclosedElements()) {
            if (ElementKind.METHOD.equals(i.getKind())) {
                if (isAnnotatedWithAction(i)) {
                    out.println(getDelegatedSource(i, simpleClassName));
//                } else {
//                    out.println(getSource(i));
                }
            }
        }
    }

    private String getDelegatedSource(Element i, String simpleClassName) {
        StringWriter sw;
        PrintWriter out = new PrintWriter(sw = new StringWriter());

        printActionDeclaration(out, i);

        String params = createParamsStringForCall(i);

        if (devuelveVoid(i)) {
            if (esEstatico(i)) {
                out.println("            " + simpleClassName + "." +  i.getSimpleName() + "(" + params + ");");
            } else if (isTransactional(i)) {
                out.println("        JPAHelper.transact(em -> {");
                out.println("            " + simpleClassName + " o = em.find(" + simpleClassName + ".class, _id);");
                out.println("            ReflectionHelper.copy(this, o);");
                out.println("            o." +  i.getSimpleName() + "(" + params + ");");
                out.println("        });");

                out.println("        _instance = JPAHelper.find(" + simpleClassName + ".class, _id);");
                out.println("        ReflectionHelper.copy(_instance, this);");
            } else {
                out.println("            ReflectionHelper.copy(this, _instance);");
                out.println("            _instance." +  i.getSimpleName() + "(" + params + ");");
                out.println("            ReflectionHelper.copy(_instance, this);");
            }
        } else {

            Trees trees = Trees.instance(processingEnv);
            MethodTree methodTree = (MethodTree) trees.getTree(i);
            String returnType = methodTree.getReturnType().toString();

            if (esEstatico(i)) {
                out.println("            return " + simpleClassName + "." +  i.getSimpleName() + "(" + params + ");");
            } else if (isTransactional(i)) {
                out.println("        final " + returnType + "[] r = new " + returnType + "[1];");
                out.println("        JPAHelper.transact(em -> {");
                out.println("            " + simpleClassName + " o = em.find(" + simpleClassName + ".class, _id);");
                out.println("            ReflectionHelper.copy(this, o);");
                out.println("            r[0] = o." +  i.getSimpleName() + "(" + params + ");");
                out.println("        });");

                out.println("        _instance = JPAHelper.find(" + simpleClassName + ".class, _id);");
                out.println("        ReflectionHelper.copy(_instance, this);");
                out.println("        return r[0];");
            } else {
                out.println("            ReflectionHelper.copy(this, _instance);");
                out.println("            " + returnType + " r = _instance." +  i.getSimpleName() + "(" + params + ");");
                out.println("            ReflectionHelper.copy(_instance, this);");
                out.println("            return r;");
            }
        }

        out.println("}");
        return sw.toString();
    }

    private boolean devuelveVoid(Element e) {
        Trees trees = Trees.instance(processingEnv);

        MethodTree methodTree = (MethodTree) trees.getTree(e);

        if ("void".equals(methodTree.getReturnType().toString())) return true;

        return false;
    }

    private boolean esEstatico(Element e) {
        Trees trees = Trees.instance(processingEnv);

        MethodTree methodTree = (MethodTree) trees.getTree(e);

        if (methodTree.getModifiers().toString().contains("static")) return true;

        return false;
    }

    private void printActionDeclaration(PrintWriter out, Element e) {
        Trees trees = Trees.instance(processingEnv);
        MethodTree methodTree = (MethodTree) trees.getTree(e);

        String s = "";
        s += methodTree.getModifiers().toString();
        s += " ";
        s += methodTree.getReturnType().toString();
        s += " ";
        s += methodTree.getName().toString();
        s += "(";

        int pos = 0;
        for (VariableTree parameter : methodTree.getParameters()) {
            if (!("javax.persistence.EntityManager".equals(parameter.getType().toString()) || "EntityManager".equals(parameter.getType().toString()))) {
                if (pos++ > 0) s += ", ";
                s += parameter.getModifiers().toString();
                s += " ";
                s += parameter.getType().toString();
                s += " ";
                s += parameter.getName().toString();
            }
        }

        s += ")";

        pos = 0;
        boolean lanzaThrowable = false;
        for (ExpressionTree aThrow : methodTree.getThrows()) {
            if (pos++ == 0) s += " throws ";
            else s += ", ";
            s += aThrow.toString();
            lanzaThrowable = "java.lang.Throwable".equals(aThrow.toString()) || "Throwable".equals(aThrow.toString());
        }
        if (!lanzaThrowable && isTransactional(e)) {
            if (pos++ == 0) s += " throws ";
            else s += ", ";
            s += "Throwable";
        }

        s += " {";

        out.println(s);

    }

    private String createParamsStringForCall(Element e) {
        String params = "";

        Trees trees = Trees.instance(processingEnv);

        String s = "";
        MethodTree methodTree = (MethodTree) trees.getTree(e);

        for (VariableTree parameter : methodTree.getParameters()) {
            if (!"".equals(params)) params += ", ";
            params += parameter.getName().toString();
        }

        return params;
    }

    private boolean isTransactional(Element e) {
        Trees trees = Trees.instance(processingEnv);

        MethodTree methodTree = (MethodTree) trees.getTree(e);

        for (VariableTree parameter : methodTree.getParameters()) {
            if ("javax.persistence.EntityManager".equals(parameter.getType().toString()) || "EntityManager".equals(parameter.getType().toString())) return true;
        }

        return false;
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

        for (Element i : e.getEnclosedElements()) {
            if (ElementKind.FIELD.equals(i.getKind())) {
                out.println(getSource(i).replaceAll(" final ", " "));
            }
        }

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