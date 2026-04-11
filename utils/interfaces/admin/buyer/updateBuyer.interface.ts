export interface UpdateBuyerPayload {
    id: number;
    name: string;
    email: string;
    phone?: string;
    onboarding_status: 'done' | 'pending';
    personal_id_document?: Buffer;
    categories?: number[];
};