import { NextResponse } from 'next/server';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const containerId = searchParams.get('id');

    if (!containerId) {
      // Retorna lista de containers
      const containers = await docker.listContainers({ all: true });
      const apps = containers.map(c => ({
        id: c.Id,
        name: c.Names[0].replace(/^\//, ''),
        state: c.State
      }));
      return NextResponse.json({ status: 'success', containers: apps });
    }

    // Retorna os logs do container específico
    const container = docker.getContainer(containerId);
    const logs = await container.logs({ stdout: true, stderr: true, tail: 200, timestamps: true });
    
    // Limpa o cabeçalho binário do log multiplexado do dockerode
    const logString = logs.toString('utf8').replace(/[\x00-\x1F]/g, '\n').trim();

    return NextResponse.json({ status: 'success', logs: logString });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
