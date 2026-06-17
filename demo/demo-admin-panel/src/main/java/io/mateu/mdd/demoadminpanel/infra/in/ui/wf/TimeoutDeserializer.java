package io.mateu.mdd.demoadminpanel.infra.in.ui.wf;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

import java.io.IOException;
import java.time.Duration;

/**
 * Deserializes the step timeout field accepting two formats:
 * <ul>
 *   <li>Integer — treated as milliseconds (e.g. {@code 30000})</li>
 *   <li>ISO 8601 duration string — converted to milliseconds
 *       (e.g. {@code "PT30S"}, {@code "PT5M"}, {@code "PT1H30M"})</li>
 * </ul>
 * Both {@code 0} and {@code null} mean "no timeout".
 */
public class TimeoutDeserializer extends StdDeserializer<Long> {

    public TimeoutDeserializer() {
        super(Long.class);
    }

    @Override
    public Long deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.currentToken() == JsonToken.VALUE_NUMBER_INT
                || p.currentToken() == JsonToken.VALUE_NUMBER_FLOAT) {
            return p.getLongValue();
        }
        if (p.currentToken() == JsonToken.VALUE_NULL) {
            return 0L;
        }
        String text = p.getText().trim();
        if (text.isEmpty()) {
            return 0L;
        }
        return Duration.parse(text).toMillis();
    }

    @Override
    public Long getNullValue(DeserializationContext ctxt) {
        return 0L;
    }
}
