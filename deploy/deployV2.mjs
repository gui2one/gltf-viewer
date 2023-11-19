import * as ftp from "basic-ftp";
import env from "dotenv";

env.config();

const LOCAL_DIR = "./dist";
const DISTANT_DIR = "/httpdocs/gui2one/gltf-viewer";

example();
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
    catch(err) {
        console.log(err)
    }
    client.close()
}