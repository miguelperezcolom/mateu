package com.example.demo.infra.ui.menus.forms;

import io.mateu.mdd.shared.annotations.Attribute;
import io.mateu.mdd.shared.annotations.Element;
import lombok.Data;

/*
<model-viewer alt="Neil Armstrong's Spacesuit from the Smithsonian Digitization Programs Office and National Air and Space Museum"
              src="assets/ford_mustang_1965.glb"
              ar
              environment-image="assets/moon_1k.hdr"
              poster="assets/NeilArmstrong.webp"
              shadow-intensity="1"
              camera-controls
              touch-action="pan-y"
              style="width: 400px; height: 400px;"
></model-viewer>
 */

@Element("model-viewer")
@Data
public class ModelViewer {

  @Attribute private String src = "/myassets/NeilArmstrong.glb";

  @Attribute private String style = "width: 400px; height: 400px;";

  @Attribute("auto-rotate")
  private String autoRotate = "auto-rotate";

  @Attribute("camera-controls")
  private String cameraControls = "camera-controls";
}
