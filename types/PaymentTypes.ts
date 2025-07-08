export type PaymentMethod = {
    name: string;
    test: string;
    active: string;
    method: string;
    cours: number;
    full_summ: number;
    description: string;
    valute: string;
    type: string;
}

export type PaymentRegion = {
    region: string;
    subregion: string;
    types: string[];
    methods: {
        [key: string]: PaymentMethod;
    }
}
