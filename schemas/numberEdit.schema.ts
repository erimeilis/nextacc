import {z} from 'zod'
import {schemaEmail} from './email.schema'
import {schemaPhone} from './phone.schema'
import {schemaHttps} from './https.schema'

// Schema for number edit form validation
export const schemaNumberEdit = z.object({
    // Basic Settings
    name: z.string().or(z.literal('')),
    autorenew: z.boolean(),
    // ExtMan Settings - Voice Settings
    ff_num: z.string().optional().or(z.literal('')),
    type_num1: z.string().optional().or(z.literal('')),
    f_num1: z.string().optional().or(z.literal('')),
    forward_type2: z.string().optional().or(z.literal('')),
    type_num2: z.string().optional().or(z.literal('')),
    f_num2: z.string().optional().or(z.literal('')),
    f_time1: z.number().min(0, {message: 'invalid_time'}).optional().nullable(),
    f_time2: z.number().min(0, {message: 'invalid_time'}).optional().nullable(),
    vm: z.number().min(0, {message: 'invalid_number'}).optional().nullable(),
    vm_file: z.string().optional().or(z.literal('')),
    vm_email: z.string().optional().or(z.literal(''))
        .refine((val) => !val || schemaEmail.safeParse(val).success, {
            message: 'invalid_email'
        }),
    //vm_beep: z.string().optional().or(z.literal('')),
    //hello_file: z.string().optional().or(z.literal('')),

    // SMS Settings
    forward_email: z.string().optional().or(z.literal(''))
        .refine((val) => !val || schemaEmail.safeParse(val).success, {
            message: 'invalid_email'
        }),
    forward_http: z.string().optional().or(z.literal(''))
        .refine((val) => !val || schemaHttps.safeParse(val).success, {
            message: 'invalid_url'
        }),
    forward_telegram: z.string().optional().or(z.literal(''))
        .refine((val) => !val || schemaHttps.safeParse(val).success, {
            message: 'invalid_url'
        }),
    forward_slack: z.string().optional().or(z.literal(''))
        .refine((val) => !val || schemaHttps.safeParse(val).success, {
            message: 'invalid_url'
        }),
    forward_sms: z.string().optional().or(z.literal(''))
        .refine((val) => !val || schemaPhone.safeParse(val).success, {
            message: 'invalid_phone'
        }),

    // Boolean fields (checkboxes) - these don't need validation
    hello_enable: z.union([z.string(), z.boolean()]).optional(),
    forwarding_disabled: z.boolean().optional(),
    //show_real_caller_id: z.union([z.string(), z.boolean()]).optional(),
    //call_to_all_device: z.union([z.string(), z.boolean()]).optional(),
    //use_user_pbx: z.union([z.string(), z.boolean()]).optional(),
    //extend_user_pbx: z.union([z.string(), z.boolean()]).optional(),
    sms_activated: z.boolean().optional(),
    forward_email_activate: z.boolean().optional(),
    forward_http_activate: z.boolean().optional(),
    forward_telegram_activate: z.boolean().optional(),
    forward_slack_activate: z.boolean().optional(),
    forward_sms_activate: z.boolean().optional(),
    //call_activated: z.boolean().optional(),
    //voip_call: z.boolean().optional(),
    //call_show_real_caller_id: z.boolean().optional(),
}).passthrough() // Allow unknown fields to pass through for debugging

export type NumberEditFormData = z.infer<typeof schemaNumberEdit>
