export interface TokenPaylod {
    userId: string;
    email: string;
    role: string;
    orgId?: string;
}
export declare const generateAccessToken: (payload: TokenPaylod) => string;
export declare const generateRefreshToken: (payload: TokenPaylod) => string;
export declare const verifyAccessToken: (token: string) => TokenPaylod;
export declare const verifyRefreshToken: (token: string) => TokenPaylod;
export declare const generateTokenPair: (payload: TokenPaylod) => {
    accessToken: string;
    refreshToken: string;
};
//# sourceMappingURL=jwt.lib.d.ts.map