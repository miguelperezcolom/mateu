package io.mateu.core.domain.model.util;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import io.mateu.core.domain.uidefinition.shared.data.IconChooser;

import java.io.IOException;

public class IconChooserSerializer extends StdSerializer<IconChooser> {

    public IconChooserSerializer() {
        this(null);
    }

    public IconChooserSerializer(Class<IconChooser> t) {
        super(t);
    }

    @Override
    public void serialize(IconChooser iconChooser, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        if (iconChooser == null || iconChooser.getIcon() == null) {
            jsonGenerator.writeNull();
        }
        jsonGenerator.writeString(iconChooser.getIcon().toString());
    }
}
