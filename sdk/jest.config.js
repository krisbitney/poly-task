module.exports = {
    roots: ["<rootDir>"],
    testMatch: ["**/?(*.)+(test).+(ts|tsx|js)"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
    testEnvironment: "node",
};