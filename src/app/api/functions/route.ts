import { NextResponse } from 'next/server';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ status: 'error', message: 'O código não pode estar vazio' }, { status: 400 });
    }

    // Puxa a imagem node:18-alpine (assumindo que seja rápida ou já exista)
    // Para um sistema real, essa imagem ficaria em cache local
    const image = 'node:18-alpine';

    const container = await docker.createContainer({
      Image: image,
      Cmd: ['node', '-e', code],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false
    });

    await container.start();

    // Aguarda finalizar
    await container.wait();

    // Pega os logs
    const logs = await container.logs({ stdout: true, stderr: true });
    
    // O dockerode retorna um buffer multiplexado (stdout/stderr) com headers de 8 bytes
    // Remover o cabeçalho de multiplexação (forma simplificada, converte e tira sujeira básica)
    const logString = logs.toString('utf8').replace(/[\x00-\x1F]/g, '');

    // Remove contêiner efêmero
    await container.remove();

    return NextResponse.json({ status: 'success', output: logString });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
