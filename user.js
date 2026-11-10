
import { createFileService } from "./file.js";

const userService = createFileService("user.json");
const postService = createFileService("post.json");

export async function handleUserRoutes(req, res) {

   if (req.method === "GET" && req.url === "/users") {
    const users = await userService.getData();
    const posts = await postService.getData();

    const result = users.map(user => {
        return {
            ...user,
            posts: posts.filter(post => post.userId === user.id)
        };
    });

    return res.writeHead(200, {
        "Content-Type": "application/json"
    }).end(JSON.stringify(result));
}

if (req.method === "GET" && /^\/users\/\d+$/.test(req.url)) {
    const id = Number(req.url.split("/")[2]);

    const users = await userService.getData();
    const user = users.find(item => item.id === id);

    if (!user) {
        return res.writeHead(404, {
            "Content-Type": "application/json"
        }).end(JSON.stringify({
            message: "User not found"
        }));
    }

    const posts = await postService.getData();

    const userPosts = posts.filter(post => post.userId === id);

    const result = {
        ...user,
        posts: userPosts
    };

    return res.writeHead(200, {
        "Content-Type": "application/json"
    }).end(JSON.stringify(result));
}
    if (req.method === "POST" && req.url === "/users") {
        try {
            let body = "";

            for await (const chunk of req) {
                body += chunk;
            }

            const userData = JSON.parse(body);
            const users = await userService.getData();

            const id = users.length
                ? Math.max(...users.map(u => u.id)) + 1
                : 1;

            const newUser = {
                ...userData,
                id
            };

            await userService.addItem(newUser);

            return res.writeHead(201, {
                "Content-Type": "application/json"
            }).end(JSON.stringify(newUser));

        } catch (error) {
            return res.writeHead(400, {
                "Content-Type": "application/json"
            }).end(JSON.stringify({
                message: "Invalid JSON"
            }));
        }
    }

    if (req.method === "PUT" && /^\/users\/\d+$/.test(req.url)) {
        try {
            const id = Number(req.url.split("/")[2]);

            let body = "";

            for await (const chunk of req) {
                body += chunk;
            }

            const userData = JSON.parse(body);
            const users = await userService.getData();

            const index = users.findIndex(user => user.id === id);

            if (index === -1) {
                return res.writeHead(404).end(JSON.stringify({
                    message: "User not found"
                }));
            }

            users[index] = {
                ...userData,
                id
            };

            await userService.saveData(users);

            return res.writeHead(200, {
                "Content-Type": "application/json"
            }).end(JSON.stringify(users[index]));

        } catch (error) {
            return res.writeHead(400).end(JSON.stringify({
                message: "Invalid JSON"
            }));
        }
    }
    if (req.method === "DELETE" && /^\/users\/\d+$/.test(req.url)) {
        const id = Number(req.url.split("/")[2]);

        const users = await userService.getData();
        const user = users.find(u => u.id === id);

        if (!user) {
            return res.writeHead(404).end(JSON.stringify({
                message: "User not found"
            }));
        }

        const posts = await postService.getData();

        await userService.saveData(
            users.filter(u => u.id !== id)
        );
        await postService.saveData(
            posts.filter(p => p.userId !== id)
        );

        return res.writeHead(204).end();
    }

}
