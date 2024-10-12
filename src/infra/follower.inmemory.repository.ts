import { FollowerRepository } from "../application/follower.repository"

export class InMemoryFollowerRepository implements FollowerRepository {
    followers = new Map<string, string[]>();

    givenExistingFollowees(user: string, followees: string[]) {
        this.followers.set(user, followees);

        console.log(this.followers);
    }

    save(user: string, follow: string): Promise<void> {
        const userExist = this.followers.get(user);

        if (userExist) {
            this.followers.set(user, [...userExist, follow])
        } else {
            this.followers.set(user, [follow])
        }
        console.log(this.followers);

        return Promise.resolve();
    }

    getUser(user: string): Promise<string[]> {
        const userExist = this.followers.get(user);

        if (userExist) {
            return Promise.resolve(userExist);
        }

        return Promise.resolve([]);
    }

}