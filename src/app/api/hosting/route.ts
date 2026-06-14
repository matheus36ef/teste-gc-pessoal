import { NextResponse } from 'next/server';
import { docker, ensureNetwork, ensureImage, sanitizeName, NETWORK_NAME } from '@/lib/docker-utils';

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
        ports: c.Ports.filter(p => p.PublicPort).map(p => `${p.PublicPort}->${p.PrivatePort}`).join(', ')
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

    const safeName = sanitizeName(name);
    if (!safeName) return NextResponse.json({ status: 'error', message: 'Nome inválido' }, { status: 400 });

    await ensureNetwork();
    await ensureImage(image);

    const portBindings: any = {};
    const exposedPorts: any = {};
    
    exposedPorts[`${port}/tcp`] = {};
    portBindings[`${port}/tcp`] = [{ HostPort: '0' }]; 

    const containerName = `app-${safeName}`;

    try {
      const old = docker.getContainer(containerName);
      await old.remove({ force: true });
    } catch (e) {}

    const container = await docker.createContainer({
      Image: image,
      name: containerName,
      ExposedPorts: exposedPorts,
      HostConfig: {
        PortBindings: portBindings,
        RestartPolicy: { Name: 'always' },
        NetworkMode: NETWORK_NAME
      },
      Labels: {
        'minha-nuvem-type': 'hosting'
      }
    });

    await container.start();

    const info = await container.inspect();
    const allocatedPort = info.NetworkSettings.Ports[`${port}/tcp`]?.[0]?.HostPort || 'Desconhecida';

    return NextResponse.json({ 
      status: 'success', 
      message: 'Aplicação hospedada com sucesso!',
      allocatedPort
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
