package io.mateu.mdd.annotationProcessing;

import com.google.auto.service.AutoService;
import com.google.common.base.Strings;
import io.mateu.mdd.core.annotations.MateuUI;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;

@SupportedAnnotationTypes({"io.mateu.mdd.core.annotations.MateuUI"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
public class MateuUIAnnotationProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (TypeElement annotation : annotations) {
            Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

            for (Element e : annotatedElements) {
                String className = ((TypeElement) e).getQualifiedName().toString();
                String simpleClassName = ((TypeElement) e).getSimpleName().toString();

                System.out.println("MateuUIAnnotationProcessor running on " + simpleClassName);

                String generatedFullClassName = className + "Servlet";
                String pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
                String generatedClassName = generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);

                JavaFileObject builderFile = null;
                try {
                    builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "UI");
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …

                        out.println("package " + pkgName + ";");
                        out.println("import " + className + ";");

                        out.println("import io.mateu.mdd.vaadin.MateuUI;");
                        out.println("import com.vaadin.annotations.*;");
                        out.println("import com.vaadin.annotations.JavaScript;");
                        out.println("import com.vaadin.navigator.PushStateNavigation;");
                        out.println("import lombok.extern.slf4j.Slf4j;");

                        out.println("");


                        out.println();
                        out.println("@Theme(\"" + e.getAnnotation(MateuUI.class).theme() + "\")\n" +
                                "@JavaScript({\"https://code.jquery.com/jquery-3.4.1.min.js\"})\n" +
                                //"@StyleSheet(\"https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css\")\n" +
                                "@JavaScript({\"https://use.fontawesome.com/releases/v5.15.4/js/all.js\"})\n" +
                                "@JavaScript({\"../../VAADIN/js/include.js\"})\n" +
                                "@Viewport(\"width=device-width, initial-scale=1\")\n" +
                                "@PushStateNavigation // para urls sin #!\n" +
                                "@Push\n" +
                                //"@PreserveOnRefresh\n" +
                                "@Slf4j\n");

                        for (String s : e.getAnnotation(MateuUI.class).stylesheets()) {
                            if (!s.contains(":")) s = "../../VAADIN/" + s;
                            out.println("@StyleSheet(\"" + s + "\")");
                        }
                        for (String s : e.getAnnotation(MateuUI.class).scripts()) {
                            if (!s.contains(":")) s = "../../VAADIN/" + s;
                            out.println("@JavaScript(\"" + s + "\")");
                        }

                        out.println("public class " + simpleClassName + "UI extends MateuUI {");
                        out.println("");
                        out.println("}");
                    }

                    builderFile = processingEnv.getFiler().createSourceFile(generatedFullClassName);
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …

                        out.println("package " + pkgName + ";");
                        out.println("import " + className + ";");

                        out.println("import io.mateu.mdd.core.annotations.MateuUIServlet;");
                        out.println("import " + pkgName + "." + simpleClassName + "UI;");
                        out.println("import com.vaadin.annotations.VaadinServletConfiguration;");
                        out.println("import com.vaadin.server.DeploymentConfiguration;");
                        out.println("import com.vaadin.server.*;");

                        out.println("");

                        out.println("import javax.servlet.ServletConfig;");
                        out.println("import javax.servlet.ServletException;");
                        out.println("import javax.servlet.annotation.WebServlet;");
                        out.println("import java.util.Properties;");
                        out.println("import javax.servlet.annotation.WebInitParam;");



                        out.println();
                        out.println("@WebServlet(urlPatterns = {\"" + e.getAnnotation(MateuUI.class).path() + "\", \"" + ("/".equals(e.getAnnotation(MateuUI.class).path())?"":e.getAnnotation(MateuUI.class).path()) + "/*\"}, name = \"" + className.replaceAll("\\.","_") + "UIServlet\", asyncSupported = true, initParams = {\n" +
                                "        @WebInitParam(name = \"org.atmosphere.websocket.suppressJSR356\", value = \"true\")})");
                        out.println("@VaadinServletConfiguration(ui = " + simpleClassName + "UI.class, productionMode = false)");
                        out.println("@MateuUIServlet(path=\"" + e.getAnnotation(MateuUI.class).path() + "\")");
                        out.println("public class " + generatedClassName + " extends VaadinServlet implements SessionInitListener {");
                        out.println("");

                        out.println("    @Override");
                        out.println("    protected DeploymentConfiguration createDeploymentConfiguration(Properties initParameters) {");
                        out.println("        if (\"true\".equals(System.getProperty(\"productionMode\"))) initParameters.setProperty(\"productionMode\", Boolean.toString(true));");
                        out.println("        return super.createDeploymentConfiguration(initParameters);");
                        out.println("    }");

                        out.println("");

                        out.println("    @Override\n" +
                                "    public void init(ServletConfig servletConfig) throws ServletException {\n" +
                                "        servletConfig.getServletContext().setAttribute(\"" + ("".equals(e.getAnnotation(MateuUI.class).path())?"/":e.getAnnotation(MateuUI.class).path()) + "_app\", " + className.substring(className.lastIndexOf(".") + 1) + ".class);\n" +
                                "        super.init(servletConfig);\n" +
                                "    }\n");


                        out.println("@Override\n" +
                                "       protected void servletInitialized() throws ServletException {\n" +
                                "           super.servletInitialized();\n" +
                                "           getService().addSessionInitListener(this);\n" +
                                "       }");

                        out.println("@Override\n" +
                                "    public void sessionInit(SessionInitEvent sessionInitEvent) throws ServiceException {\n");
                        if (!Strings.isNullOrEmpty(e.getAnnotation(MateuUI.class).favIcon())) {
                            String fi = e.getAnnotation(MateuUI.class).favIcon();
                            if (!fi.contains(":")) fi = "./VAADIN/" + fi;
                            out.println("sessionInitEvent.getSession().addBootstrapListener(new BootstrapListener() {\n" +
                                    "\n" +
                                    "        @Override\n" +
                                    "        public void modifyBootstrapPage(BootstrapPageResponse response) {\n" +
                                    "            response.getDocument().head()\n" +
                                    "                    .getElementsByAttributeValue(\"rel\", \"shortcut icon\")\n" +
                                    "                    .attr(\"href\", \"" + fi + "\");\n" +
                                    "            response.getDocument().head()\n" +
                                    "                    .getElementsByAttributeValue(\"rel\", \"icon\")\n" +
                                    "                    .attr(\"href\", \"" + fi + "\");\n" +
                                    "        }\n" +
                                    "\n" +
                                    "        @Override\n" +
                                    "        public void modifyBootstrapFragment(BootstrapFragmentResponse response) {\n" +
                                    "        }\n" +
                                    "\n" +
                                    "    });");
                        }

                        out.println("    }");


                        out.println("");
                        out.println("}");
                    }

                    if (false) {
                        builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "ServletFilter");
                        try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                            // writing generated file to out …

                            out.println("package " + pkgName + ";");

                            out.println("");

                            out.println("import io.mateu.security.web.MateuSecurityFilter;");
                            out.println("import javax.servlet.annotation.WebFilter;" +
                                    "import javax.servlet.Filter;");

                            out.println("import org.springframework.core.annotation.Order;\n" +
                                    "import org.springframework.stereotype.Component;");


                            out.println();

                            String privatePath = e.getAnnotation(MateuUI.class).path();
                            if (!privatePath.endsWith("/")) privatePath += "/";
                            privatePath += "private/*";

                            out.println("@WebFilter(\"" + privatePath + "\")" +
                                    "public class " + simpleClassName + "ServletFilter extends MateuSecurityFilter implements Filter {");
                            out.println("");
                            out.println("}");
                        }

                        builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "ServletFilterRegistrationBean");
                        try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                            // writing generated file to out …

                            out.println("package " + pkgName + ";");

                            out.println("");

                            out.println("import org.springframework.boot.web.servlet.FilterRegistrationBean;\n" +
                                    "import org.springframework.boot.web.servlet.ServletRegistrationBean;\n" +
                                    "import org.springframework.stereotype.Service;");

                            out.println();

                            String privatePath = e.getAnnotation(MateuUI.class).path();
                            if (!privatePath.endsWith("/")) privatePath += "/";
                            privatePath += "private/*";

                            out.println("@Service\n" +
                                    "public class " + simpleClassName + "ServletFilterRegistrationBean extends FilterRegistrationBean {");
                            out.println("");
                            out.println("public " + simpleClassName + "ServletFilterRegistrationBean() {\n" +
                                    "        super();\n" +
                                    "        setFilter(new " + simpleClassName + "ServletFilter());\n" +
                                    "        addUrlPatterns(\"" + privatePath + "\");\n" +
                                    "        setName(\"" + simpleClassName + "Filter\");\n" +
                                    "        setOrder(1);\n" +
                                    "    }");
                            out.println();
                            out.println("}");
                        }

                    }

                } catch (IOException ex) {
                    ex.printStackTrace();
                }


            }
        }

        return true;
    }
}
