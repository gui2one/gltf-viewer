/** BE VERY CAREFULL
 * 
 * given the right credentials, 
 * this script will delete all the files in the directory defined in DISTANT_DIR 
 * 
 */

require('dotenv').config();

var FTP = require('ftp-simple');
var path = require('path');
var fs = require("fs");
const readline = require("readline");

async function confirmDelete(msg)
{
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });    
    return new Promise((resolve)=>{
        rl.question(msg, ans=>{
            rl.close();
            if( ans !== "y") {
                console.warn("aborting ... ")
                resolve(false);
            }else{

                console.warn("removing distant directory content")
                resolve(true);
            }
        })
    });
}

const DISTANT_DIR = "httpdocs/gui2one/gltf-viewer";
const PARENT_DIR = path.dirname(DISTANT_DIR);
const LOCAL_DIR = "./dist";
// const LOCAL_DIR = "./ftp_test";

var config = {
    port : 21,
    host: process.env.FTP_HOST,
    username: process.env.FTP_USER,
    password: process.env.FTP_PASS,
    type: 'ftp'
};


var ftp = FTP.create(config);

const list_distant_files = async (dir_path)=>{

   await new Promise((resolve, reject)=>{
       ftp.ls(dir_path, function (err, list) {
           if (err) {
                // ftp.close();
               reject(err);
           } else {
                resolve(list);
           }


       });
   })
}

const removeDir = async (distant_dir_path)=>{
    await new Promise((resolve, reject)=>{
        ftp.rm(distant_dir_path, function (err) {
            if (err) {
                // console.log(err);
                reject(err)
            } else{
                resolve(true);
            }
        })
    })
}

const uploadDir = async (local_dir ,parent_dir)=>{
    

    let num_files = fs.readdirSync(LOCAL_DIR).length;
    console.log(`Uploading ${num_files} Files to ${DISTANT_DIR}`);
    await new Promise((resolve, reject)=>{
        ftp.upload(local_dir, "/" + parent_dir, (err)=>{
            if(err){
                process.exit();
                reject(err);
            }else{
                resolve(true)
            }
        })
    })
}

list_distant_files(DISTANT_DIR).then(async(list)=>{

    let confirm_delete = await confirmDelete(`\x1b[33mAbout to delete distance folder conent at ${config.host} --- ${DISTANT_DIR}. \nAre you sure ? (y/n) : \x1b[0m`);
    // console.log("CONFIRM DELETE ", confirm_delete);
    if( confirm_delete === true)
    {
        removeDir("/"+DISTANT_DIR).then((result)=>{


            uploadDir(LOCAL_DIR, PARENT_DIR).then((result) => {
                // console.log(result);
                ftp.close();
            })
        }).catch((reason)=>{
            console.log(`ERROR : ${reason}`);

            uploadDir(LOCAL_DIR, PARENT_DIR).then((result) => {
        
                ftp.close();
            })
        })
    }else{
        
        process.exit();
    }
}).catch((reason)=>{
    console.log(`Problem while Listing -> ${DISTANT_DIR} -- ${reason}`);
    
    ftp.mkdir("/"+DISTANT_DIR, function(err){
        if(err)
        {
            console.log(err);
        }
        console.log(`created directory ?`);
        ftp.close();
    });

    // uploadDir(LOCAL_DIR, PARENT_DIR).then((result)=>{
    //     console.log(result);
    //     ftp.close();
    // })
})



