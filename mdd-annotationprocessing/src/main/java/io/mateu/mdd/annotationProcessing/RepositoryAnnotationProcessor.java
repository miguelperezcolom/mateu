package io.mateu.mdd.annotationProcessing;

import com.google.auto.service.AutoService;
import com.sun.source.tree.BlockTree;
import com.sun.source.tree.MethodTree;
import com.sun.source.tree.StatementTree;
import com.sun.source.util.Trees;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.lang.model.element.TypeParameterElement;
import javax.lang.model.type.DeclaredType;
import javax.lang.model.type.ExecutableType;
import javax.lang.model.type.TypeMirror;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@SupportedAnnotationTypes({"io.mateu.mdd.core.annotations.Repository"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
public class RepositoryAnnotationProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        System.out.println("RepositoryAnnotationProcessor.process()");
        for (TypeElement annotation : annotations) {
            Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

            for (Element e : annotatedElements) {
                String className = ((TypeElement) e).getQualifiedName().toString();
                String simpleClassName = ((TypeElement) e).getSimpleName().toString();

                System.out.println("RepositoryAnnotationProcessor running on " + simpleClassName);

                String generatedFullClassName = className + "Impl";
                String pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
                String generatedClassName = generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);

                JavaFileObject builderFile = null;
                try {
                    builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "Impl");
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …

                        Map<String, String> genericos = new HashMap<>();
                        fillGenericos(roundEnv, out, (TypeElement) e, genericos);

                        out.println("package " + pkgName + ";");
                        out.println("import " + className + ";");

                        out.println("import lombok.extern.slf4j.Slf4j;");

                        out.println("import io.mateu.mdd.util.JPAHelper;");
                        out.println("import java.util.List;");
                        out.println("import javax.persistence.EntityManager;");

                        out.println("");

                        out.println();
                        out.println("public class " + simpleClassName + "Impl implements " + simpleClassName + " {");
                        out.println("");
                        out.println("    private EntityManager em;");
                        out.println("    private Class entityType = " + genericos.get("T") + ".class;");
                        out.println("");
                        out.println("    public " + simpleClassName + "Impl(EntityManager em) { this.em = em; }");
                        out.println("");

                        // e es un ClassSymbol

                        implement(roundEnv, out, (TypeElement) e, genericos);

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

    private void fillGenericos(RoundEnvironment roundEnv, PrintWriter out, TypeElement e, Map<String, String> genericos) {
        for (TypeMirror i : ((TypeElement) e).getInterfaces()) {
            DeclaredType declaredType = (DeclaredType)i;
            int pos = 0;
            TypeElement ee = (TypeElement) processingEnv.getTypeUtils().asElement(i);
            for(TypeMirror p : declaredType.getTypeArguments()){
                genericos.put(ee.getTypeParameters().get(pos++).toString(), p.toString());
            }
            fillGenericos(roundEnv, out, ee, genericos);
        }
    }

    private void implement(RoundEnvironment roundEnv, PrintWriter out, TypeElement e, Map<String, String> genericos) {
        for (TypeMirror i : ((TypeElement) e).getInterfaces()) {
            TypeElement ee = (TypeElement) processingEnv.getTypeUtils().asElement(i);
            implement(roundEnv, out, ee, genericos);
        }

        printMethodsImplementation(roundEnv, out, e, genericos);
    }

    private void printMethodsImplementation(RoundEnvironment roundEnv, PrintWriter out, TypeElement e, Map<String, String> genericos) {
        for (Element ee : e.getEnclosedElements()) { // devuelve getByName que es un methodsymbol
            printMethodImplementation(roundEnv, out, ee, genericos);
        }
    }

    private void printMethodImplementation(RoundEnvironment roundEnv, PrintWriter out, Element ee, Map<String, String> genericos) {
        Map<String, String> paramTypes = toParamsMap(ee);
        ExecutableType t = (ExecutableType) ee.asType();
        Trees trees = Trees.instance(processingEnv);

        boolean tieneImplementacionPorDefecto = false;
        MethodTree methodTree = (MethodTree) trees.getTree(ee);
        if (methodTree != null) {
            BlockTree blockTree = methodTree.getBody();
            if (blockTree != null) {
                tieneImplementacionPorDefecto = true;
                for (StatementTree statementTree : blockTree.getStatements()) {
                    // *do something with the statements*
                }
            }
        }

        if (!tieneImplementacionPorDefecto) {
            ee.getSimpleName();
            ee.getEnclosedElements(); // no devuelve nada
            out.println("    @Override");
            String rt = resolve(roundEnv, genericos, t.getReturnType());
            String mn = ee.getSimpleName().toString();
            String throwses = "";
            for (TypeMirror thrownType : t.getThrownTypes()) {
                if ("".equals(throwses)) throwses += "throws ";
                else throwses += ", ";
                throwses += thrownType.toString();
            }
            out.println("    public " + rt + " " + mn + "(" + toParamsDeclaration(paramTypes, genericos) + ") " + throwses + " {");
            printMethodBody(out, rt, mn, paramTypes);
            out.println("    }");
        }
    }

    private void printMethodBody(PrintWriter out, String rt, String mn, Map<String, String> paramTypes) {
        if ("find".equals(mn)) {
            if (paramTypes.size() == 1 && paramTypes.containsValue("java.lang.Object[]")) {
                out.println("        return (" + rt + ") JPAHelper.find(em, entityType, p0000);");
            } else if (paramTypes.size() == 1) {
                out.println("        return (" + rt + ") JPAHelper.find(em, entityType, p0000);");
            } else {
                out.println("        throw new RuntimeException(new Exception(\"Wrong fignature for method find. unable to generate implementation\"));");
            }
        } else if ("findAll".equals(mn)) {
            out.println("        return JPAHelper.findAll(em, entityType);");
        } else if ("save".equals(mn)) {
            out.println("        return em.merge(p0000);");
        } else if ("delete".equals(mn)) {
            if (paramTypes.size() == 1 && paramTypes.containsValue("java.lang.Object[]")) {
                out.println("        JPAHelper.delete(em, entityType, p0000);");
            } else if (paramTypes.size() == 1) {
                out.println("        em.remove(p0000);");
            } else {
                out.println("        throw new RuntimeException(new Exception(\"Wrong fignature for method delete. unable to generate implementation\"));");
            }
        } else if ("deleteWithId".equals(mn)) {
            out.println("        JPAHelper.deleteWithId(em, entityType, p0000);");
        } else if ("list".equals(mn)) {
            out.println("        return JPAHelper.list(em, entityType, p0000);");
        } else {
            out.println("        throw new RuntimeException(new Exception(\"Method not implemented\"));");
            //if (!"void".equals(rt)) out.println("        return null;");
        }

        /*
            @Override
    public void deleteWithId(java.lang.Long p0000)  {
        throw new RuntimeException(new Exception("Method not implemented"));
    }
    @Override
    public java.util.Optional<io.mateu.test.model.Entidad> find(java.lang.Object[] p0000)  {
        return null;
    }
    @Override
    public java.util.List<io.mateu.test.model.Entidad> list(java.lang.Object[] p0000)  {
        throw new RuntimeException(new Exception("Method not implemented"));
    }
    @Override
    public void delete(java.lang.Object[] p0000)  {
        em.remove(p0000);
    }
         */
    }

    private String resolve(RoundEnvironment roundEnv, Map<String, String> genericos, TypeMirror type) {
        String s = type.toString();
        s = resolverGenericos(genericos, s);
        return genericos.containsKey(s)?genericos.get(s):s;
    }

    private String resolverGenericos(Map<String, String> genericos, String s) {
        if (s.contains("<")) {
            String z = s.substring(s.indexOf("<") + 1, s.lastIndexOf(">"));
            s = s.substring(0, s.indexOf("<") + 1) + resolverGenericos(genericos, z) + s.substring(s.lastIndexOf(">"));
        } else {
            String z = "";
            for (String t : s.split(",")) {
                if (!"".equals(z)) z += ", ";
                z += resolve(genericos, t.trim());
            }
            s = z;
        }
        return s;
    }

    private String resolve(Map<String, String> genericos, String type) {
        return genericos.containsKey(type)?genericos.get(type):type;
    }

    private Map<String, String> toParamsMap(Element ee) {
        Map<String, String> m = new LinkedHashMap<>();

        ExecutableType t = (ExecutableType) ee.asType();
        int count = 0;
        DecimalFormat df = new DecimalFormat("0000");
        for (TypeMirror p : t.getParameterTypes()) {
            m.put("p" + df.format(count++), p.toString());
        }

        return m;
    }

    private String toParamsDeclaration(Map<String, String> m, Map<String, String> genericos) {
        String s = "";
        for (String k : m.keySet()) {
            if (!"".equals(s)) s += ", ";
            s += resolve(genericos, m.get(k)) + " " + k;
        }
        return s;
    }
}
