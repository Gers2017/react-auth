function getEnv<T>(key: string) {
    if (!process.env[key]) {
        throw new Error(
            `Missing ${key} on process.env. Did you forget to write it in the .env file?`,
        );
    }
    return process.env[key]!;
}

export const COOKIE_ID = getEnv("COOKIE_ID");
