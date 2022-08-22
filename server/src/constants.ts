function getEnv<T>(key: string) {
    if (!process.env[key]) {
        throw new Error(
            `Missing ${key} on process.env. Did you forget to write it in the .env file?`,
        );
    }
    return process.env[key]!;
}

export const COOKIE_ID = getEnv("COOKIE_ID");
export const ACCESS_SECRET = getEnv("ACCESS_SECRET");
export const REFRESH_SECRET = getEnv("REFRESH_SECRET");
