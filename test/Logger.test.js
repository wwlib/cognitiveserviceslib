const { Logger } = require('../lib/Logger');

const logger = new Logger();

test('Logger is defined', () => {
    // logger.debug('Test', 1, 2, 3)
    expect(Logger).toBeDefined();
});

