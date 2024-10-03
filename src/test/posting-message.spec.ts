describe("Feature: Posting a message", () => {
    describe("Rule: A message can contain a maximum of 200 characters", () => {

        test("Alice can post a message on a timeline", () => {
            givenNowIS(new Date("2023-01-19T19:00:00.000Z"))

            whenUserPostMessage({
                id: "message-id",
                text: "Hello World",
                author: "Alice"
            })

            thenPostedMessageShouldBe({
                id: "message-id",
                text: "Hello World",
                author: "Alice",
                publishedAt: new Date("2023-01-19T19:00:00.000Z")
            })
        });
    })
});


let message: {
    id: string,
    text: string,
    author: string,
    publishedAt: Date
} = {
    id: "message-id",
    text: "Hello World",
    author: "Alice",
    publishedAt: new Date("2023-01-19T19:00:00.000Z")
};
let now: Date;

function givenNowIS(_now: Date) { 
    now = _now;
}

function whenUserPostMessage(postMessageCommand: {
    id: string,
    text: string,
    author: string
}) {
    message = {
        id: postMessageCommand.id,
        text: postMessageCommand.text,
        author: postMessageCommand.author,
        publishedAt: new Date("2023-01-19T19:00:00.000Z")
    };

}

function thenPostedMessageShouldBe(expectedMessage: {
    id: string,
    text: string,
    author: string,
    publishedAt: Date
}) {
    expect(expectedMessage).toEqual(message);
}