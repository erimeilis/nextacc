// Statistics type definitions

export interface CallStatistics {
    datetime: string;
    caller_id: string;
    virtual_number: string;
    forwarding: string;
    duration: number;
    cost: number;
    status: string;
}

export interface IncomingSmsStatistics {
    id: number;
    id_incoming_sms: number;
    id_cc_card: number;
    id_cc_did: number;
    send_email: boolean;
    send_http: boolean;
    http_respond: string;
    cost_sms: number;
}

export interface SmsStatistics {
    id: number;
    date: string;
    id_cc_provider: number;
    default_cost: number;
    ip: string;
    from_number: string;
    to_number: string;
    sms_text: string;
    id_incoming_sms_stat: number;
    full_request: string;
    status: string;
    incoming_sms_stat: IncomingSmsStatistics;
}
