package io.mateu.mdd.core.model.common;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Embeddable;

@Embeddable
@Getter@Setter
public class GeoLocalization {

    private String latitude;

    private String longitude;

    private String googleMapsUrl;

    protected GeoLocalization() {

    }

    public GeoLocalization(String googleMapsUrl) {
        this.googleMapsUrl = googleMapsUrl;
    }

    public GeoLocalization(String latitude, String longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
