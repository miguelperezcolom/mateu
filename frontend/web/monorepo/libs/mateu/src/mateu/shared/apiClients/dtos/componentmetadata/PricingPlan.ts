export default interface PricingPlan {
    id?: string
    name?: string
    price?: string
    period?: string
    featured?: boolean
    features?: string[]
    ctaLabel?: string
    actionId?: string
}
