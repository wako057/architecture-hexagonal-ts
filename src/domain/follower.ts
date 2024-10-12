
export class Follower {
    private constructor(private readonly _user: string, private readonly _followee: string[]) { }

    get user() {
        return this._user;
    }

    get followee() {
        return this._followee;
    }

    get data() {
        return {
            user: this.user,
            followee: this.followee
        };
    }

    static fromData(data: Follower['data']) {
        return new Follower(
            data.user, 
            data.followee
        );
    }
}