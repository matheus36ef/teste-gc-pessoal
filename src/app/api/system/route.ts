import { NextResponse } from 'next/server';
// import Docker from 'dockerode';
// const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export async function GET() {
  // Simulando a resposta do Docker e do sistema para a VM no Google Cloud
  try {
    // Código real seria:
    // const containers = await docker.listContainers();
    // const cpuUsage = await getSystemCpu();
    
    return NextResponse.json({
      status: 'success',
      metrics: {
        cpu: '24%',
        ram: { used: '3.2 GB', total: '8 GB' },
        activeContainers: 7
      },
      services: [
        { name: 'meu-blog-nextjs', type: 'web', status: 'online', uptime: '14 dias' },
        { name: 'postgres-main-db', type: 'db', status: 'online', uptime: '30 dias' },
        { name: 'processa-imagem-func', type: 'function', status: 'idle', uptime: '-' }
      ]
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: 'Failed to connect to Docker daemon' }, { status: 500 });
  }
}
