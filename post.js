
import { createFileService } from "./file.js";

const postService = createFileService("post.json");
const userService = createFileService("user.json");

export async function handlePostRoutes(req, res) {

    if (req.method === "GET" && req.url === "/posts") {
        const posts = await postService.getData();

        return res.writeHead(200, {
            "Content-Type": "application/json"
        }).end(JSON.stringify(posts));
    }
    if (req.method === "GET" && /^\/posts\/\d+$/.test(req.url)) {
        const id = Number(req.url.split("/")[2]);

        const posts = await postService.getData();
        const post = posts.find(p => p.id === id);

        if (!post) {
            return res.writeHead(404).end(JSON.stringify({
                message: "Post not found"
            }));
        }

        return res.writeHead(200, {
            "Content-Type": "application/json"
        }).end(JSON.stringify(post));
    }
    if (req.method === "GET" && /^\/users\/\d+\/posts$/.test(req.url)) {
        const userId = Number(req.url.split("/")[2]);

        const users = await userService.getData();
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.writeHead(404).end(JSON.stringify({
                message: "User not found"
            }));
        }

        const posts = await postService.getData();
        const userPosts = posts.filter(p => p.userId === userId);

        return res.writeHead(200, {
            "Content-Type": "application/json"
        }).end(JSON.stringify(userPosts));
    }
    if (req.method === "POST" && req.url === "/posts") {
        try {
            let body = "";

            for await (const chunk of req) {
                body += chunk;
            }

            const postData = JSON.parse(body);

            const users = await userService.getData();
            const user = users.find(u => u.id === Number(postData.userId));

            if (!user) {
                return res.writeHead(404).end(JSON.stringify({
                    message: "User not found"
                }));
            }

            if (typeof postData.content !== "string" || !postData.content.trim()) {
                return res.writeHead(400).end(JSON.stringify({
                    message: "Content is required"
                }));
            }

            const posts = await postService.getData();

            const id = posts.length
                ? Math.max(...posts.map(p => p.id)) + 1
                : 1;

            const newPost = {
                id,
                userId: user.id,
                content: postData.content
            };

            await postService.addItem(newPost);

            return res.writeHead(201, {
                "Content-Type": "application/json"
            }).end(JSON.stringify(newPost));

        } catch (error) {
            return res.writeHead(400).end(JSON.stringify({
                message: "Invalid JSON"
            }));
        }
    }
    if (req.method === "PUT" && /^\/posts\/\d+$/.test(req.url)) {
        try {
            const id = Number(req.url.split("/")[2]);

            let body = "";

            for await (const chunk of req) {
                body += chunk;
            }

            const postData = JSON.parse(body);
            const posts = await postService.getData();

            const index = posts.findIndex(p => p.id === id);

            if (index === -1) {
                return res.writeHead(404).end(JSON.stringify({
                    message: "Post not found"
                }));
            }

            if (postData.userId !== undefined) {
                const users = await userService.getData();
                const user = users.find(
                    u => u.id === Number(postData.userId)
                );

                if (!user) {
                    return res.writeHead(404).end(JSON.stringify({
                        message: "User not found"
                    }));
                }
            }

            posts[index] = {
                ...postData,
                id,
                userId: postData.userId !== undefined
                    ? Number(postData.userId)
                    : posts[index].userId
            };

            await postService.saveData(posts);

            return res.writeHead(200, {
                "Content-Type": "application/json"
            }).end(JSON.stringify(posts[index]));

        } catch (error) {
            return res.writeHead(400).end(JSON.stringify({
                message: "Invalid JSON"
            }));
        }
    }
    if (req.method === "DELETE" && /^\/posts\/\d+$/.test(req.url)) {
        const id = Number(req.url.split("/")[2]);

        const posts = await postService.getData();
        const post = posts.find(p => p.id === id);

        if (!post) {
            return res.writeHead(404).end(JSON.stringify({
                message: "Post not found"
            }));
        }

        await postService.saveData(
            posts.filter(p => p.id !== id)
        );

        return res.writeHead(204).end();
    }
}
