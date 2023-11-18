require("esbuild").build({
    entryPoints : ["src/main.ts"],
    bundle : true,
    outdir : "./dist"
})