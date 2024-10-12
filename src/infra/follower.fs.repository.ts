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

        console.log('a', this.followerPath);
        try {
    
            console.log('b', this.followerPath);
            // const data = await fs.promises.readFile(this.followerPath, { encoding: 'utf8' });
            const data = fs.readFileSync(this.followerPath, { encoding: 'utf8' });
            console.log('c', data);
            parsedData = JSON.parse(data);
            console.log('d', parsedData);
        } catch (err) {
            // console.error('e', err);
        } 
        console.log('f');

        const returnValue = new Map<string, string[]>();
        console.log('g', parsedData);

        for (const user in parsedData) {
            console.log('iteration: ', user);
            returnValue.set(user, parsedData[user]);
        }
        console.log('h', returnValue);

        return returnValue;
    }

    async save(user: string, followee: string): Promise<void> {
        console.log('FileSystemFollowerRepository 1');
        const followers = await this.getAllFollowers()
console.log('on est de retour dans save: ', followers);
        if (followers.has(user)) {
            console.log('on ajoute', [...followers.get(user)!, followee]);
            followers.set(user, [...followers.get(user)!, followee])
        } else {
            followers.set(user, [followee]);
        }
        console.log('FileSystemFollowerRepository');
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
        console.log(this.followerPath);
        fs.writeFileSync(this.followerPath, this.toJSON(data), { flag: 'w+' });
        console.log('on a tenter decrire', this.toJSON(data));
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