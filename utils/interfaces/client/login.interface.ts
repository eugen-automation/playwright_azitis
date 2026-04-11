export interface ClientLoginResponse {
    token_type: string;
    expires_in: number;
    access_token: string;
    type: string;
}