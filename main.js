
import { createServer } from "node:http";
import { handleUserRoutes } from "./user.js";
import { handlePostRoutes } from "./post.js";

const app = createServer(async (req, res) => {
    try {
        await handleUserRoutes(req, res);
        if (res.writableEnded) return;
        await handlePostRoutes(req, res);
        if (res.writableEnded) return;
        res.writeHead(404, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            message: "Route not found"
        }));
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.writeHead(500, {
                "Content-Type": "application/json"
            });
        }
        if (!res.writableEnded) {
            res.end(JSON.stringify({
                message: "Internal server error"
            }));
        }
    }
});

app.listen(4009, () => {
    console.log("Server is running on port 4009");
});
