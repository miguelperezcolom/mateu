export default interface Option {

    value: string
    label: string
    description: string
    image: string
    imageStyle: string
    icon: string
    // sub-options of a hierarchical option set (tree selects); empty on flat lists
    children?: Option[]

}
