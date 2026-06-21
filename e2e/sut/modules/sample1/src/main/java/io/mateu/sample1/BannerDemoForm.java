package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/banners")
@Title("Banner Demo Form")
@Getter
@Setter
public class BannerDemoForm {

    String name;

    @Banner(theme = BannerTheme.INFO, title = "Info Banner")
    public String infoBannerMessage() {
        return "This is an informational message.";
    }

    @Banner(theme = BannerTheme.WARNING, title = "Warning Banner")
    public String warningBannerMessage() {
        return "Please review carefully.";
    }

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
