// const { ChatbotSession, ChatbotResponse, ChatbotStatus } = require('../lib');

const { MockChatbotSession } = require('../lib');

const session = new MockChatbotSession();

session.init()
    .then((prompt) => {
        console.log(prompt);
        session.getNextResponse('Make me a sandwich.')
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });
    })
    .catch((error) => {
        console.log(error);
    });