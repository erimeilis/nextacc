export type CallDestinationInfo = {
    // Call Destination data (for voice or toll-free numbers)
    call_destination?: string
    call_priority?: number | null
    call_activated?: boolean
    voip_call?: boolean
    follow_droid_caller_id?: string
    call_show_real_caller_id?: boolean
}
