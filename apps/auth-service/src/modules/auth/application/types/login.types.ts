export type LoginUserOutput = {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    accessToken: string;
    refreshToken: string;
};