import { Message } from "../domain/message"
import { v4 as uuidv4 } from 'uuid';

export const messageBuilder = ({
    id = uuidv4(),
    author = "Author",
    text = "some text",
    publishedAt = new Date("2023-01-19T19:00:00.000Z")
}: {
    id?: string,
    author?: string,
    text?: string,
    publishedAt?: Date,
} = {}) => {
    const props = { id, author, text, publishedAt };

    return {

        withId(_id: string) {
            return messageBuilder({
                ...props,
                id: _id
            })
        },

        authoredBy(_author: string) {
            return messageBuilder({
                ...props,
                author: _author
            })
        },

        withText(_text: string) {
            return messageBuilder({
                ...props,
                text: _text
            })
        },

        withDate(_publishedAt: Date) {
            return messageBuilder({
                ...props,
                publishedAt: _publishedAt
            })
        },
        
        build(): Message {

            return Message.fromData({ 
                id: props.id,
                author: props.author,
                text: props.text,
                publishedAt: props.publishedAt
            });
        }
    };
};