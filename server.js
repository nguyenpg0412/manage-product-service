const app = require("./app");

const PORT = 3000;

const server = app.listen(3000, () =>  console.log(`server is listing on port ${PORT}`));

process.on("SIGINT", function() {
    server.close( () => console.log("server is closing..."));
});