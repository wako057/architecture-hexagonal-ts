import * as path from "path";
import * as fs from "fs";
import { FollowerRepository } from "../application/follower.repository";
import { Follower } from "../domain/follower";

export class FileSystemFollowerRepository implements FollowerRepository {
    constructor(
        private readonly followerPath = path.join(__dirname, "follower.json")
    ) { }

    private async getAllFollowers(): Promise<Map<string, string[]>> {
        let parsedData = {};

        // const data = await fs.promises.readFile(this.followerPath, { encoding: 'utf8' });
        const data = fs.readFileSync(this.followerPath, { encoding: 'utf8' });
        parsedData = JSON.parse(data);

        const returnValue = new Map<string, string[]>();

        for (const user in parsedData) {
            returnValue.set(user, parsedData[user]);
        }

        return returnValue;
    }

    async save(user: string, followee: string): Promise<void> {
        const followers = await this.getAllFollowers()
        if (followers.has(user)) {
            followers.set(user, [...followers.get(user)!, followee])
        } else {
            followers.set(user, [followee]);
        }
        return this._save(followers);
    }

    toJSON(data: Map<string, string[]>): string {
        const obj = {};
        for (const [key, value] of data) {
            obj[key] = value;
        }
        return JSON.stringify(obj);
    }

    async _save(data: Map<string, string[]>): Promise<void> {
        fs.writeFileSync(this.followerPath, this.toJSON(data), { flag: 'w+' });
        return ;
        // return fs.promises.writeFile(
        //     this.followerPath, this.toJSON(data)
        // );
    }


    async getUser(user: string): Promise<string[]> {
        const followers = await this.getAllFollowers();

        const back = followers.has(user) ? followers.get(user)! : [];

        return Promise.resolve(back);
    }

}