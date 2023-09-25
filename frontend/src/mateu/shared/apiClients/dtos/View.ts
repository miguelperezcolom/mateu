import ViewPart from "./ViewPart";

export default interface View {

    title: string

    subtitle: string

    header: ViewPart

    left: ViewPart

    main: ViewPart

    right: ViewPart

    footer: ViewPart

}
