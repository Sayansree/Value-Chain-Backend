const request = require("supertest");
const app = require("./server");

describe("GET /", () => {
    it("responds with Hello, This Is The Default!", (done) => {
        request(app).get("/test").expect("OK", done);
    })
});

