import { NextResponse } from 'next/server';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const containers = await docker.listContainers({ all: true });
    const apps = containers
      .filter(c => c.Labels && c.Labels['minha-nuvem-type'] === 'hosting')
      .map(c => ({
        id: c.Id,
        name: c.Names[0].replace(/^\//, ''),
        image: c.Image,
        status: c.State === 'running' ? 'online' : 'offline',
        ports: c.Ports.map(p => `${p.PublicPort}->${p.PrivatePort}`).join(', ')
      }));

    return NextResponse.json({ status: 'success', apps });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, image, port } = body;

    if (!name || !image || !port) {
      return NextResponse.json({ status: 'error', message: 'Faltam campos obrigatórios' }, { status: 400 });
    }

    // Faz o pull da imagem
    await new Promise((resolve, reject) => {
      docker.pull(image, (err: any, stream: any) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, onFinished, onProgress);
        function onFinished(err: any, output: any) {
          if (err) return reject(err);
          resolve(output);
        }
        function onProgress(event: any) {}
      });
    });

    const portBindings: any = {};
    const exposedPorts: any = {};
    
    // Mapeia a porta interna do container para uma aleatória ou específica
    exposedPorts[`${port}/tcp`] = {};
    portBindings[`${port}/tcp`] = [{ HostPort: '0' }]; // 0 significa porta aleatória

    const container = await docker.createContainer({
      Image: image,
      name: `app-${name}`,
      ExposedPorts: exposedPorts,
      HostConfig: {
        PortBindings: portBindings,
        RestartPolicy: { Name: 'always' }
      },
      Labels: {
        'minha-nuvem-type': 'hosting'
      }
    });

    await container.start();

    return NextResponse.json({ status: 'success', message: 'Aplicação hospedada com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
