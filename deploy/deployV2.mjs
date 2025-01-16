import * as ftp from "basic-ftp";
import env from "dotenv";
import readline from "readline"
env.config();

const LOCAL_DIR = "./dist/gui2one/gltf-viewer";
const DISTANT_DIR = "/httpdocs/gui2one/gltf-viewer";

let do_delete = await confirmDelete(`About to delete content from ${DISTANT_DIR}\n are you sure ? (y/n) : `);

if (do_delete) {

    example();
}

function warning_colors(msg) {
    return `\x1b[33m${msg}\x1b[0m`;
}
async function confirmDelete(msg) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(warning_colors(msg), ans => {
            rl.close();
            if (ans !== "y") {
                console.warn("aborting ... ")
                resolve(false);
            } else {

                console.warn("removing distant directory content")
                resolve(true);
            }
        })
    });
}
async function example() {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASS,
            secure: false
        })
        console.log(await client.list());
        await client.ensureDir(DISTANT_DIR);
        await client.clearWorkingDir();
        await client.uploadFromDir(LOCAL_DIR);
    }
    catch (err) {
        console.log(err)
    }
    client.close()
}