package io.mateu.i18n;

import java.util.Locale;
import java.util.ResourceBundle;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


public interface Translator {

  String translate(String text);

}
