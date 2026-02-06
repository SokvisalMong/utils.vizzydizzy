import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { VideoInfo, VideoCompressionSettings } from "@/interfaces/video-compression";

let ffmpeg: FFmpeg | null = null;

export const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg;
};

// Helper to sanitize filename for FFmpeg virtual FS
const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9._]/g, "_");

export const getVideoInfo = async (file: File): Promise<VideoInfo> => {
  const ffmpeg = await loadFFmpeg();
  const safeName = sanitizeFilename(file.name);
  // Use a unique name to avoid collision during info extraction
  const inputName = `info_${Date.now()}_${safeName}`;
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  let output = "";
  const logHandler = ({ message }: { message: string }) => {
    output += message + "\n";
  };

  ffmpeg.on("log", logHandler);

  try {
    await ffmpeg.exec(["-i", inputName]);
  } catch {
    // FFmpeg exits with error code when running -i without output
    // This is expected as we just want the stderr output
  } finally {
    ffmpeg.off("log", logHandler);
    await ffmpeg.deleteFile(inputName);
  }

  const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
  let duration = 0;
  if (durationMatch) {
    duration = 
      parseInt(durationMatch[1]) * 3600 +
      parseInt(durationMatch[2]) * 60 +
      parseInt(durationMatch[3]) +
      parseInt(durationMatch[4]) / 100;
  }

  const resolutionMatch = output.match(/Stream #0:0.*?, (\d+)x(\d+)/);
  let width = 0;
  let height = 0;
  if (resolutionMatch) {
    width = parseInt(resolutionMatch[1]);
    height = parseInt(resolutionMatch[2]);
  }

  const bitrateMatch = output.match(/bitrate: (\d+) kb\/s/);
  let bitrate = 0;
  if (bitrateMatch) {
    bitrate = parseInt(bitrateMatch[1]);
  }

  return { duration, width, height, bitrate };
};

export const compressVideo = async (
  file: File,
  settings: VideoCompressionSettings,
  onProgress: (progress: number) => void,
  existingInfo?: VideoInfo
): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();
  const safeName = sanitizeFilename(file.name);
  const inputName = `input_${Date.now()}_${safeName}`;
  const outputName = `output_${Date.now()}.mp4`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // Reuse existing info or fetch if not provided
  const info = existingInfo || await getVideoInfo(file);
  
  const args = ["-i", inputName];

  if (settings.targetResolution !== "original") {
    args.push("-vf", `scale=-2:${settings.targetResolution}`);
  }

  if (settings.targetSizeValue > 0) {
    let targetSizeBytes = 0;
    if (settings.targetSizeUnit === "MB") {
      targetSizeBytes = settings.targetSizeValue * 1024 * 1024;
    } else {
      targetSizeBytes = (info.bitrate * 1024 / 8) * info.duration * (settings.targetSizeValue / 100);
      if (targetSizeBytes === 0 || isNaN(targetSizeBytes)) {
         targetSizeBytes = file.size * (settings.targetSizeValue / 100);
      }
    }

    const targetBitrate = Math.floor((targetSizeBytes * 8) / (info.duration || 1));
    args.push("-b:v", `${targetBitrate > 0 ? targetBitrate : 500000}`);
  } else {
    args.push("-crf", settings.crf.toString());
  }

  args.push("-preset", "ultrafast");
  args.push("-y", outputName); // Overwrite output if it exists

  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress(progress * 100);
  };

  ffmpeg.on("progress", progressHandler);

  try {
    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(outputName);
    
    // Ensure we have a regular Uint8Array (non-shared) for the Blob
    const dataArray = data as unknown as Uint8Array;
    const uint8Array = new Uint8Array(dataArray).slice();
    const blob = new Blob([uint8Array], { type: "video/mp4" });

    return blob;
  } finally {
    ffmpeg.off("progress", progressHandler);
    try {
      await ffmpeg.deleteFile(inputName);
    } catch {}
    try {
      await ffmpeg.deleteFile(outputName);
    } catch {}
  }
};
