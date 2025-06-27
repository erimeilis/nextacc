export type ExtManInfo = {
    // ExtMan data (for voice or toll-free numbers)
    ff_num?: string
    type_num1?: string
    f_num1?: string
    forward_type2?: string
    type_num2?: string
    f_num2?: string
    f_time1?: number | null
    f_time2?: number | null
    vm?: number | null
    vm_file?: string
    vm_email?: string
    vm_beep?: boolean
    hello_enable?: boolean
    hello_file?: string
    ff?: number | null
    cf?: number | null
    show_real_caller_id?: boolean
    folow_droid_id?: boolean
    call_to_all_device?: boolean
    use_user_pbx?: string
    extend_user_pbx?: boolean
    forwarding_disabled?: boolean
}
