package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

/**
 * A select whose options come from an arbitrary REST endpoint, fetched CLIENT-SIDE — the first
 * surface of consuming non-Mateu endpoints. The JSON is served same-origin by the app
 * (static/rest-options-demo.json); {@code itemsPath} navigates to the array, {@code valuePath}/
 * {@code labelPath} map each item (the label lives at a nested path to exercise dot navigation).
 */
@UI("/rest-options")
@Title("REST Options Form")
@Getter
@Setter
public class RestOptionsForm {

    @RestOptions(
            url = "/rest-options-demo.json",
            itemsPath = "data.countries",
            valuePath = "code",
            labelPath = "name.common")
    String country;

    @Button
    public Message submit() {
        return new Message("Selected country: " + country);
    }
}
