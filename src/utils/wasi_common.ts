import { Environment, WASI, _FS } from '@cloudflare/workers-wasi'

export interface ExecOptions {
  args?: string[]
  asyncify: boolean
  env?: Environment
  fs: _FS
  // moduleName: string
  preopens: string[]
  returnOnExit: boolean
  stdin?: string
}

export interface ExecResult {
  stdout: string
  stderr: string
  status?: number
}

export const exec = async (
  options: ExecOptions,
  wasm: WebAssembly.Module,
  body?: ReadableStream<Uint8Array>
): Promise<ExecResult> => {

  const stdout = new TransformStream()
  const stderr = new TransformStream()

  const wasi = new WASI({
    args: options.args,
    env: options.env,
    fs: options.fs,
    preopens: options.preopens,
    returnOnExit: options.returnOnExit,
    stderr: stderr.writable,
    stdin: body,
    stdout: stdout.writable,
    streamStdio: options.asyncify,
  })
  const instance = new WebAssembly.Instance(wasm, {
    wasi_snapshot_preview1: wasi.wasiImport,
  })
  const promise = wasi.start(instance)

  const streams = await Promise.all([
    collectStream(stdout.readable),
    collectStream(stderr.readable),
  ])

  try {
    const result = {
      stdout: streams[0],
      stderr: streams[1],
      status: await promise,
    }
    return result
  } catch (e: any) {
    e.message = `${e}\n\nstdout:\n${streams[0]}\n\nstderr:\n${streams[1]}\n\n`
    throw e
  }
}

const collectStream = async (stream: ReadableStream): Promise<string> => {
  const chunks: Uint8Array[] = []

  // @ts-ignore
  for await (const chunk of stream) {
    chunks.push(chunk)
  }

  const size = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0)
  const buffer = new Uint8Array(size)
  let offset = 0

  chunks.forEach((chunk) => {
    buffer.set(chunk, offset)
    offset += chunk.byteLength
  })

  return new TextDecoder().decode(buffer)
}
function writeArrayToStream(array, writableStream) {
  const writer = writableStream.getWriter();
  array.forEach(chunk => writer.write(chunk).catch(() => { }));
  return writer.close();
}

export async function writeStringToStream(data, writableStream) {
  const encoder = new TextEncoder();
  const array = encoder.encode(data);
  const writer = writableStream.getWriter();

  try {
    for (const chunk of array) {
      await writer.write(Uint8Array.of(chunk)); // Ensure it's a Uint8Array
    }
    await writer.close();
    console.log('All done writing to stream!');
  } catch (e) {
    console.error('Error writing to stream:', e);
    throw e; // Re-throw the error to be caught by the caller
  } finally {
    // Ensure the writer is always released
    writer.releaseLock();
  }
}