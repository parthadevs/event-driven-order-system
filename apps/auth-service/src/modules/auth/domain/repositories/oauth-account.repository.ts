import { OAuthAccountEntity } from "../entities/oauth-account.entity";

export abstract class OAuthAccountRepository {
    abstract create(oauthAccount: OAuthAccountEntity): Promise<OAuthAccountEntity>;
    abstract findByProviderAndProviderId(provider: string, providerId: string): Promise<OAuthAccountEntity | null>;
    abstract findByUserId(userId: string): Promise<OAuthAccountEntity[]>;
}