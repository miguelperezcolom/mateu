package io.mateu.util.i18n;

import com.google.common.base.Strings;
import io.mateu.mdd.shared.AppConfigLocator;
import io.mateu.util.Helper;

import java.util.Map;

public class DeepLClient {

    public String translate(String source_lang, String target_lang, String text) throws Throwable {
        if (Strings.isNullOrEmpty(text)) return text;
        String json = Helper.httpGet("https://api.deepl.com/v2/usage?auth_key=" + Helper.getImpl(AppConfigLocator.class).get().getDeeplAuthKey() + "&source_lang=" + source_lang.toUpperCase() + "&target_lang=" + target_lang.toUpperCase() + "&text=" + text);
        if (!Strings.isNullOrEmpty(json)) {
            return (String) ((Map<String, Object>[])Helper.fromJson(json).get("translations"))[0].get("text");
        } else return null;
    }

}
