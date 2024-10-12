export interface FollowerRepository {
    save(user: string, follow: string): Promise<void>;
    getUser(user: string): Promise<string[]>;
}