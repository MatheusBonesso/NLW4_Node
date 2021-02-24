import request from 'supertest'
import { app } from '../app'

import createConnection from '../database'

describe("Users", () => {
    
    beforeAll(async () => {
        const connection = await createConnection();
        await connection.runMigrations();
    });

    it("Should be able to create new user", async () => {
     const response = await  request(app).post("/users").send({
            email: "user@example.com",
            name: "user"
        });
        expect(response.status).toBe(201);
    })
});
