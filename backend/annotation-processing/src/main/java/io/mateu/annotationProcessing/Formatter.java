package io.mateu.annotationProcessing;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import freemarker.template.TemplateExceptionHandler;
import java.io.IOException;
import java.io.StringWriter;
import java.util.Map;

public class Formatter {

  private static Configuration cfg;

  private final String templateName;
  private final Map<String, Object> model;

  static {
    cfg = new Configuration(Configuration.VERSION_2_3_29);
    // cfg.setDirectoryForTemplateLoading(new File("/where/you/store/templates"));
    cfg.setClassForTemplateLoading(Formatter.class, "/templates");
    // Recommended settings for new projects:
    cfg.setDefaultEncoding("UTF-8");
    cfg.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);
    cfg.setLogTemplateExceptions(false);
    cfg.setWrapUncheckedExceptions(true);
    cfg.setFallbackOnNullLoopVariable(false);
  }

  public Formatter(String template, Map<String, Object> model) {
    this.templateName = template;
    this.model = model;
  }

  public String apply() throws TemplateException, IOException {
    Template tempplate = cfg.getTemplate(templateName);

    StringWriter out = new StringWriter();
    tempplate.process(model, out);

    return out.toString();
  }
}
