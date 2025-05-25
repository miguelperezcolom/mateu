package io.mateu.core.domain.reflection;

import static io.mateu.core.domain.reflection.GetterProvider.getGetter;
import static org.junit.jupiter.api.Assertions.*;

import com.example.uis.forms.SimpleForm;
import org.junit.jupiter.api.Test;

class GetterProviderTest {

  @Test
  void returnsGetter() throws NoSuchFieldException {

    var getter = getGetter(SimpleForm.class.getDeclaredField("stringField"));
    assertEquals("getStringField", getter);

    getter = getGetter(SimpleForm.class.getDeclaredField("booleanField"));
    assertEquals("isBooleanField", getter);
  }
}
