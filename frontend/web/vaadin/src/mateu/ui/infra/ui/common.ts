export const parseOverrides = (overrides: string | undefined) => {
    if (overrides) {
        try {
            return JSON.parse(overrides)
        } catch (exception) {
            console.log('error when trying to parse overrides', overrides, exception)
            return {
                value: overrides
            }
        }
    } else {
        return {}
    }
}