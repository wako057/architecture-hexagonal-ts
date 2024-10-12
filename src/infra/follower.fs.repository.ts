import * as path from "path";
import * as fs from "fs";
import { FollowerRepository } from "../application/follower.repository";
import { Follower } from "../domain/follower";

export class FileSystemFollowerRepository implements FollowerRepository {
    constructor(
        private readonly messagePath = path.join(__dirname, "follower.json")
    ) { }

    private async getAllFollowers(): Promise<Map<string, string[]>> {
        const data = await fs.promises.readFile(this.messagePath);
        const parsedData = JSON.parse(data.toString());
        const returnValue = new Map<string, string[]>;

        for (const user in parsedData) {
            returnValue.set(user, parsedData[user]);
        }
        return Promise.resolve(returnValue);
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
        
        return Promise.resolve(
            fs.promises.writeFile(
                this.messagePath, this.toJSON(data)
            )
        );
    }


    async getUser(user: string): Promise<string[]> {
        const followers = await this.getAllFollowers();

        const back = followers.has(user) ? followers.get(user)! : [];

        return Promise.resolve(back);
    }

}