package com.example.uis;

import io.mateu.uidl.interfaces.HasFavicon;

public class UsingInterfacesUI implements HasFavicon {

    @Override
    public String getFavicon() {
        return "fav_icon";
    }
}
