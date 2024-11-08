package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Caption;
import io.mateu.uidl.annotations.*;

@io.mateu.uidl.annotations.Caption("Images")
public record ImageForm(
        @Image(style = "height: 64px; width: 64px;")
                @Caption("")
        String image,
        @Image(style = "height: 148px; width: 148px;")
        String imageWithCaption,
        @Image
        @CallActionOnClick("assess")
        @Style("height: var(--lumo-icon-size-l); width: var(--lumo-icon-size-l);")
        String clickableImage,

        @Image
        @Style("height: var(--lumo-icon-size-l); width: var(--lumo-icon-size-l);")
        String imageFromSvg,

        @ReadOnly
        String assessment
) {



    @Action(visible = false)
    ImageForm assess() {
        return new ImageForm(
                image,
                imageWithCaption,
                clickableImage,
                imageFromSvg,
                "It works!"
        );
    }

}
