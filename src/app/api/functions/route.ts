import { NextResponse } from 'next/server';
import { docker, ensureImage } from '@/lib/docker-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ status: 'error', message: 'O código não pode estar vazio' }, { status: 400 });
    }

    const image = 'node:18-alpine';
    
    // Agora o pull é protegido, rápido se já existe, e evita timeout na interface
    await ensureImage(image);

    const container = await docker.createContainer({
      Image: image,
      Cmd: ['node', '-e', code],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false
    });

    await container.start();
    await container.wait();

    const logs = await container.logs({ stdout: true, stderr: true });
    const logString = logs.toString('utf8').replace(/[\x00-\x1F]/g, '');

    await container.remove({ force: true });

    return NextResponse.json({ status: 'success', output: logString });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
