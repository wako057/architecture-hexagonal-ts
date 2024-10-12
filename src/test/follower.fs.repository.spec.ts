import * as path from "path";
import * as fs from "fs";
import { FileSystemFollowerRepository } from "../infra/follower.fs.repository";

const testFollowerPath = path.join(__dirname, "follower-test.json");

describe("FileSystemFollowerRepository", () => {
    beforeEach(async () => {
        await fs.promises.writeFile(testFollowerPath, JSON.stringify(
            {
                Alice: ["Bob", "Carlito"],
                Bob: ["Greg"],
            }
        ));
    })

    test('save()', async () => {
        const fileSystemFollowerRepository = new FileSystemFollowerRepository(testFollowerPath);

        await fileSystemFollowerRepository.save("Alice", "Gros");
        const expectedResult = { Alice: [ 'Bob', 'Carlito', 'Gros' ], Bob: [ 'Greg' ] };
        const followerData = await fs.promises.readFile(testFollowerPath);
        const followerJSON = JSON.parse(followerData.toString());
        
        expect(followerJSON).toMatchObject(expectedResult);
    })
})