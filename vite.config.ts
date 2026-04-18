import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  // dist/index.html을 폴더째로 열거나 정적 호스팅할 때 경로가 깨지지 않도록 상대 경로 사용
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile()],
});
