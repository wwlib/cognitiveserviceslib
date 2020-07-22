// const { ChatbotSession, ChatbotResponse, ChatbotStatus } = require('../lib');

const { HealthBotSession } = require('../lib');

const config = require('./config.json');

const userId = `dl_${Math.random()}`;
// const beginCommand = 'begin ntd_rapo_hcbot_test1_sc1';

const session = new HealthBotSession(config.Microsoft.HealthBotSecret, userId, true);

startTest = (data) => {
    if (data.activities && data.activities[0].text) {
        if (data.activities[0].text === 'Hello. What is your name?') {
            session.getNextResponse('Andrew')
                .then((response2) => {
                    console.log(`startTest: response2:`)
                    console.log(response2);
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            console.log(`start test: invalid prompt`);
        }
    } else {
        console.log(`start test: invalid data`);
    }

}

session.init()
    .then((data) => {
        console.log(`session.init: data:`);
        console.log(data);
        // session.getNextResponse(beginCommand)
        //     .then((response) => {
        //         console.log(`init: response:`)
        //         console.log(response);
        //         startTest(response);
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //     });
    })
    .catch((error) => {
        console.log(error);
    });

