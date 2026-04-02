---
title: "Localization"
weight: 25
---

Mateu is i18n friendly. This means that every label which appears in the UI is translated, and dates and amounts are locale formatted.

Mateu uses the browser language as the target language, and the key for translation lookup is the label text. Not only texts are translated, but also locales are respected. This means that amounts and dates will respect the browser settings.

### The translator service

Mateu relies on the bean implementing the `Translator` interface. Mateu provides a default bean (`ResourceBundleTranslator`) implementing that interface but, you already know, you can easily override that bean and use your own implementation instead. Just provide a different bean and annotate it with `@Primary`.

### Default implementation

The default bean for the `Translator` service is `ResourceBundleTranslator`. To get the translations `ResourceBundleTranslator` uses the standard java ResourceBundle mechanism under the hood. So, when looking for translations Mateu will look for `messages.properties` files in the classpath to get them. Remember that, if you are for example looking for spanish translations, it will first look for a `messages_es.properties` file in the classpath and, if not found, it will default to the `messages.properties` file.

This could be an example `messages_es.properties` file:

```properties

#Some sample values 
helloWorld=Hola mundo
This\ is\ a\ test=Esto es una prueba

```

You can find more about resource bundles [here](https://www.baeldung.com/java-resourcebundle).

