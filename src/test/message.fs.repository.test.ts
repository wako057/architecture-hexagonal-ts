
import * as path from "path";
import * as fs from "fs";

import { FileSystemMessageRepository } from "../infra/message.fs.repository";
import { messageBuilder } from "./message.builder";

const testMessagePath = path.join(__dirname, "./messages-test.json");

describe("FileSystemMessageRepository", () => {

    beforeEach(async () => {
        await fs.promises.writeFile(testMessagePath, JSON.stringify([]));
    })

    test("save() can save a message in the filesystem", async () => {
        const messageRepository = new FileSystemMessageRepository(testMessagePath);
        await messageRepository.save(
            messageBuilder()
                .authoredBy("Alice")
                .withId("m3")
                .withText("Test Message")
                .withDate(new Date("2024-10-10T13:52:10.000Z"))
                .build()
        );

        const messageData = await fs.promises.readFile(testMessagePath);
        const messageJSON = JSON.parse(messageData.toString());

        expect(messageJSON).toEqual([
            {
                id: "m3",
                author: "Alice",
                text: "Test Message",
                publishedAt: "2024-10-10T13:52:10.000Z"
            }
        ]);
    })

    test("save() can update an existing message in the filesystem", async () => {
        const messageRepository = new FileSystemMessageRepository(testMessagePath);

        await fs.promises.writeFile(testMessagePath, JSON.stringify([
            {
                id: "m3",
                author: "Alice",
                text: "Test Message",
                publishedAt: "2024-10-10T13:52:10.000Z"
            }
        ]));

        await messageRepository.save(
            messageBuilder()
                .authoredBy("Alice")
                .withId("m3")
                .withText("Test Message edited")
                .withDate(new Date("2024-10-10T13:52:10.000Z"))
                .build()
        );

        const messageData = await fs.promises.readFile(testMessagePath);
        const messageJSON = JSON.parse(messageData.toString());

        expect(messageJSON).toEqual([
            {
                id: "m3",
                author: "Alice",
                text: "Test Message edited",
                publishedAt: "2024-10-10T13:52:10.000Z"
            }
        ]);
    })

    test("getById returns a message by its id", async () => {
        const messageRepository = new FileSystemMessageRepository(testMessagePath);
        await fs.promises.writeFile(testMessagePath, JSON.stringify([
            {
                id: "m1",
                author: "Alice",
                text: "Test Message",
                publishedAt: "2024-10-10T13:52:10.000Z"
            },
            {
                id: "m3",
                author: "Bob",
                text: "Hello Test Message from Bob",
                publishedAt: "2024-10-10T13:55:10.000Z"
            }
        ]));

        const bobMessage = await messageRepository.getById("m3");

        expect(bobMessage).toEqual(
            messageBuilder()
                .withId("m3")
                .authoredBy("Bob")
                .withDate(new Date("2024-10-10T13:55:10.000Z"))
                .withText("Hello Test Message from Bob")
                .build()
        );
    })


    test("getAllOfUser returns all the messages of a specific user", async () => {
        const messageRepository = new FileSystemMessageRepository(testMessagePath);
        await fs.promises.writeFile(testMessagePath, JSON.stringify([
            {
                id: "m1",
                author: "Alice",
                text: "Test Message",
                publishedAt: "2024-10-10T13:52:10.000Z"
            },
            {
                id: "m2",
                author: "Alice",
                text: "Test Message 2",
                publishedAt: "2024-10-10T13:53:15.000Z"
            },
            {
                id: "m3",
                author: "Bob",
                text: "Hello Test Message from Bob",
                publishedAt: "2024-10-10T13:55:10.000Z"
            }
        ]));

        const aliceMessage = await messageRepository.getAllOfUser("Alice");

        expect(aliceMessage).toHaveLength(2);
        expect(aliceMessage).toEqual(
            expect.arrayContaining(
                [
                    messageBuilder()
                        .withId("m1")
                        .authoredBy("Alice")
                        .withDate(new Date("2024-10-10T13:52:10.000Z"))
                        .withText("Test Message")
                        .build(),
                    messageBuilder()
                        .withId("m2")
                        .authoredBy("Alice")
                        .withDate(new Date("2024-10-10T13:53:15.000Z"))
                        .withText("Test Message 2")
                        .build(),
                ]
            )
        );
    })
});