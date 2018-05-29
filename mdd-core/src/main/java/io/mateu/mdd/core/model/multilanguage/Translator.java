package io.mateu.mdd.core.model.multilanguage;

import com.google.cloud.translate.Translate;
import com.google.cloud.translate.TranslateOptions;
import com.google.cloud.translate.Translation;

import java.util.HashMap;
import java.util.Map;

public class Translator {

    public static String translate(String sourceLanguage, String targetLanguage, String text) {
        // Instantiates a client
        Translate translate = TranslateOptions.getDefaultInstance().getService();

        // Translates some text into Russian
        Translation translation =
                translate.translate(
                        text,
                        Translate.TranslateOption.sourceLanguage(sourceLanguage),
                        Translate.TranslateOption.targetLanguage(targetLanguage));

        String translatedText = translation.getTranslatedText();

        System.out.printf("Text: %s%n", text);
        System.out.printf("Translation: %s%n", translatedText);

        return translatedText;
    }

    public static Map<String, String> translateAll(String sourceLanguage, String text) {
        Map<String, String> m = new HashMap<>();

        m.put(sourceLanguage, text);

        for (String targetLanguage : new String[]{"es", "en", "de", "fr", "it", "ar", "cz", "ru"}) {
            if (!targetLanguage.equals(sourceLanguage)) m.put(targetLanguage, translate(sourceLanguage, targetLanguage, text));
        }

        return m;
    }

    public static void main(String[] args) {
        System.out.println(translate("es", "en", "prueba"));
    }
}
