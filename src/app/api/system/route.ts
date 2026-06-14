import { NextResponse } from 'next/server';
import Docker from 'dockerode';
import si from 'systeminformation';

// Configura o Docker. No Windows, pode não conectar se o Docker Desktop não estiver rodando.
const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Busca uso de CPU e Memória RAM
    const currentLoad = await si.currentLoad();
    const mem = await si.mem();

    const cpuUsage = currentLoad.currentLoad.toFixed(1);
    
    // Converte bytes para GB
    const memUsed = (mem.active / (1024 ** 3)).toFixed(1);
    const memTotal = (mem.total / (1024 ** 3)).toFixed(1);

    // Busca containers reais rodando no Docker
    let activeContainers = 0;
    let formattedServices: any[] = [];
    let dockerAvailable = true;

    try {
      const containers = await docker.listContainers({ all: true });
      activeContainers = containers.filter(c => c.State === 'running').length;
      
      formattedServices = containers.map(c => {
        // Pega o nome removendo a barra inicial
        const name = c.Names[0].replace(/^\//, '');
        return {
          name,
          type: 'container',
          status: c.State === 'running' ? 'online' : 'idle',
          uptime: c.Status
        };
      });
    } catch (dockerError) {
      console.warn("Aviso: Não foi possível conectar ao Docker. Ele está rodando?", dockerError);
      dockerAvailable = false;
    }

    return NextResponse.json({
      status: 'success',
      dockerAvailable,
      metrics: {
        cpu: `${cpuUsage}%`,
        ram: { used: `${memUsed} GB`, total: `${memTotal} GB`, rawPercentage: (mem.active / mem.total) * 100 },
        activeContainers
      },
      services: formattedServices
    });
  } catch (error: any) {
    console.error("Erro na API do sistema:", error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
