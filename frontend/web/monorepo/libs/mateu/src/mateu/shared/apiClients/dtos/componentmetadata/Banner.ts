import {BannerTheme} from "./BannerTheme";

export interface Banner {
    theme: BannerTheme
    hasIcon: boolean
    hasCloseButton: boolean
    title: string
    description: string
}