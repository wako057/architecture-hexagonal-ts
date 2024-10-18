import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaMessageRepository } from "../message.prisma.repository"
import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";
import { messageBuilder } from "../../test/message.builder";

const asyncExec = promisify(exec);

describe(PrismaMessageRepository, () => {
    let container: StartedPostgreSqlContainer;
    let prismaClient: PrismaClient;

    beforeAll(async () => {
        container = await new PostgreSqlContainer()
            .withDatabase("crafty-test")
            .withUsername("crafty-test")
            .withPassword("crafty-test")
            .withExposedPorts(5432)
            .start()
            ;

        prismaClient = new PrismaClient({
            datasources: {
                db: {
                    url: container.getConnectionUri()
                }
            }
        });
        await asyncExec(`DATABASE_URL=${container.getConnectionUri()} yarn prisma migrate deploy`);

        return prismaClient.$connect();
    })

    afterAll(async () => {
        await prismaClient.$disconnect();
        await container.stop();
    })

    beforeEach(async () => {
        await prismaClient.message.deleteMany();
        await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
    })

    test("save() should save a new message", async () => {
        const messageRepository = new PrismaMessageRepository(prismaClient);
        await messageRepository.save(
            messageBuilder()
                .authoredBy("Alice")
                .withId("message-id")
                .withText("Hello-World")
                .withDate(new Date("2024-10-15T11:46:18.000Z"))
                .build()
        );

        const expectedMessage = await prismaClient.message.findUnique({
            where: { id: "message-id" },
        });

        expect(expectedMessage).toEqual(
            {
                "authorId": "Alice",
                "id": "message-id",
                "publishedAt": new Date("2024-10-15T11:46:18.000Z"),
                "text": "Hello-World",
            }
        );
    })

    test("save() should update an existing message", async () => {
        const messageRepository = new PrismaMessageRepository(prismaClient);

        const aliceMessageBuilder = messageBuilder()
            .authoredBy("Alice")
            .withId("message-id")
            .withText("Hello-World")
            .withDate(new Date("2024-10-15T11:46:18.000Z"));
        await messageRepository.save(aliceMessageBuilder.build());

        await messageRepository.save(
            aliceMessageBuilder.withText("Hello World 2 - Updated Text").build()
        );

        const expectedMessage = await prismaClient.message.findUnique({
            where: { id: "message-id" },
        });

        expect(expectedMessage).toEqual(
            {
                "authorId": "Alice",
                "id": "message-id",
                "publishedAt": new Date("2024-10-15T11:46:18.000Z"),
                "text": "Hello World 2 - Updated Text",
            }
        );
    })

    test("getById() should return a message by its id", async () => {
        const messageRepository = new PrismaMessageRepository(prismaClient);

        const aliceMessage = messageBuilder()
            .authoredBy("Alice")
            .withId("message-id")
            .withText("Hello-World")
            .withDate(new Date("2024-10-15T11:46:18.000Z"))
            .build();
        await messageRepository.save(aliceMessage);

        const retrieceMessage = await messageRepository.getById("message-id");

        expect(retrieceMessage).toEqual(aliceMessage);
    })


    test("getAllOfUser() should return all users messages", async () => {
        const messageRepository = new PrismaMessageRepository(prismaClient);

        await Promise.all([
            messageRepository.save(
                messageBuilder()
                    .authoredBy("Alice")
                    .withId("message-id")
                    .withText("Hello-World")
                    .withDate(new Date("2024-10-15T11:46:18.000Z"))
                    .build()),
            messageRepository.save(
                messageBuilder()
                    .authoredBy("Bob")
                    .withId("message-id2")
                    .withText("Hi, it's Bob")
                    .withDate(new Date("2024-10-15T11:48:00.000Z"))
                    .build()),
            messageRepository.save(
                messageBuilder()
                    .authoredBy("Alice")
                    .withId("message-id3")
                    .withText("Second Message")
                    .withDate(new Date("2024-10-15T11:50:00.000Z"))
                    .build())
        ]);

        const aliceMessages = await messageRepository.getAllOfUser("Alice");

        expect(aliceMessages).toHaveLength(2);
        expect(aliceMessages).toEqual(
            expect.arrayContaining([
                messageBuilder()
                    .authoredBy("Alice")
                    .withId("message-id")
                    .withText("Hello-World")
                    .withDate(new Date("2024-10-15T11:46:18.000Z"))
                    .build(),
                messageBuilder()
                    .authoredBy("Alice")
                    .withId("message-id3")
                    .withText("Second Message")
                    .withDate(new Date("2024-10-15T11:50:00.000Z"))
                    .build()
            ]));
    })
})