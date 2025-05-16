export const parseOverrides = (overrides: string | undefined) => {
    if (overrides) {
        try {
            return JSON.parse(overrides)
        } catch (exception) {
            return {
                value: overrides
            }
        }
    } else {
        return {}
    }
}