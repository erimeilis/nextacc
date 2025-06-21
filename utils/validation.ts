import {z} from 'zod'

/**
 * Validates form data against a provided Zod schema.
 *
 * @param schema - The Zod schema to validate the form data against.
 * @param formData - The form data to validate, adhering to the schema's shape.
 * @returns An object containing:
 *   - `errors`: An object with field-specific error messages if validation fails.
 *   - `data`: The validated form data if validation succeeds, or `null` if validation fails.
 */
export const validateFormData = <T extends z.ZodTypeAny>(
    schema: T,                   // The Zod schema used for validation
    formData: z.infer<T>         // The form data to be validated
) => {
    const validation = schema.safeParse(formData) // Perform validation

    if (!validation.success) {
        // Debug: Log raw validation errors
        console.log('[DEBUG_LOG] Raw Zod validation error:', validation.error)
        console.log('[DEBUG_LOG] Zod validation issues:', validation.error.issues)

        // If validation fails, flatten errors and return them along with null data
        const errors = validation.error.flatten().fieldErrors
        console.log('[DEBUG_LOG] Flattened field errors:', errors)
        return {errors}
    }

    // If validation is successful, return validated data and no errors
    console.log('[DEBUG_LOG] Validation successful')
    return {errors: null, data: validation.data}
}

export const validateInputData = <T extends z.ZodTypeAny>(
    schema: T,                   // The Zod schema used for validation
    inputData: z.infer<T>         // The form data to be validated
) => {
    const validation = schema.safeParse(inputData) // Perform validation

    if (!validation.success) {
        // If validation fails, flatten errors and return them along with null data
        const error = validation.error.issues[0].message
        return {error}
    }

    // If validation is successful, return validated data and no errors
    return {error: null, data: validation.data}
}
