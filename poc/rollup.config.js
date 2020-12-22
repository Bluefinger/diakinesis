import ts from "@wessberg/rollup-plugin-ts";
import cjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import minifyhtml from "rollup-plugin-minify-html-literals";
import { terser } from "rollup-plugin-terser";
import html from "@rollup/plugin-html";

export default {
  input: ["./src/index.ts"],
  preserveEntrySignatures: "allow-extension",
  plugins: [
    resolve({
      mainFields: ["module", "main"],
    }),
    cjs({
      include: "./node_modules/**",
    }),
    ts({
      browserslist: false,
      tsconfig: "./tsconfig.json",
    }),
    minifyhtml(),
    html({
      title: "Diakinesis PoC",
    }),
  ],
  output: [
    {
      dir: "./dist/",
      format: "esm",
      sourcemap: true,
      chunkFileNames: "[name]-[format].js",
      assetFileNames: "assets/[name]-[ext][extname]",
      plugins: [
        terser({
          mangle: {
            properties: {
              regex: /^(_|\$\$)/,
            },
          },
          nameCache: {},
          compress: {
            passes: 3,
          },
          output: {
            ecma: 8,
          },
          module: true,
        }),
      ],
    },
  ],
};
