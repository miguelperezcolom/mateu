package io.mateu.jpa.domain.ui.cruds;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;

public class JpaRpcCrudViewDeserializer extends JsonDeserializer<JpaRpcCrudView> {
  @Override
  public JpaRpcCrudView deserialize(
      JsonParser jsonParser, DeserializationContext deserializationContext)
      throws IOException, JacksonException {
    var crud = new JpaRpcCrudView();
    /*
    JsonNode node = jsonParser.getCodec().readTree(jsonParser);
    node = node.get("action");
    String message = node.get("name").asText();
    String timestamp = node.get("timestamp").asText();
    ArchiveStatus status = new ArchiveStatus(false);

    var action = new MDDOpenCRUDAction()
    crud.init(action);

     */
    return crud;
  }
}
