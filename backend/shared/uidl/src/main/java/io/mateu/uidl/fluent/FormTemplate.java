package io.mateu.uidl.fluent;

import io.mateu.uidl.annotations.Experimental;

/**
 * The page template a {@link Form} fills — one of the design system's page templates (Redwood's, as
 * Spectra ships them), whose fields and slots are THAT template's, named as it names them. A page
 * without one is free: its {@code content} is laid out as authored. The template decides the look
 * (colours, surfaces, spacing); the page only fills it in.
 */
@Experimental("page templates (3.0 beta)")
public interface FormTemplate {}
