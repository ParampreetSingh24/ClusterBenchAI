import React, { useEffect, useRef } from 'react';

export default function ClusterCanvasBackground({ isDark = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Mouse tracker
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3 Cluster Centers
    const clusterConfig = [
      {
        baseX: 0.22,
        baseY: 0.35,
        color: isDark ? '56, 189, 248' : '2, 132, 199', // Cyan / Sky
        name: 'Cluster α'
      },
      {
        baseX: 0.78,
        baseY: 0.38,
        color: isDark ? '168, 85, 247' : '126, 34, 206', // Purple / Violet
        name: 'Cluster β'
      },
      {
        baseX: 0.50,
        baseY: 0.72,
        color: isDark ? '16, 185, 129' : '5, 150, 105', // Emerald / Mint
        name: 'Cluster γ'
      }
    ];

    let particles = [];
    const particlesPerCluster = 16;

    const initParticles = () => {
      particles = [];
      clusterConfig.forEach((cluster, clusterIdx) => {
        const cx = width * cluster.baseX;
        const cy = height * cluster.baseY;

        for (let i = 0; i < particlesPerCluster; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 110 + 20;
          particles.push({
            clusterIdx,
            cx,
            cy,
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            radius: Math.random() * 2.2 + 1.2,
            baseRadius: radius,
            angle,
            angularSpeed: (Math.random() - 0.5) * 0.006,
            color: cluster.color
          });
        }
      });
    };

    initParticles();

    // Render loop
    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Draw cluster centroid halo & rings
      clusterConfig.forEach((c, idx) => {
        const cx = width * c.baseX + Math.sin(tick * 0.01 + idx) * 15;
        const cy = height * c.baseY + Math.cos(tick * 0.012 + idx) * 15;

        // Centroid core
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.color}, ${isDark ? 0.6 : 0.4})`;
        ctx.fill();

        // Pulsing orbital ring
        const ringRadius = 90 + Math.sin(tick * 0.02 + idx) * 12;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${c.color}, ${isDark ? 0.07 : 0.05})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.angularSpeed;

        // Dynamic center drift
        const cluster = clusterConfig[p.clusterIdx];
        const dynamicCx = width * cluster.baseX + Math.sin(tick * 0.01 + p.clusterIdx) * 15;
        const dynamicCy = height * cluster.baseY + Math.cos(tick * 0.012 + p.clusterIdx) * 15;

        p.x = dynamicCx + Math.cos(p.angle) * p.baseRadius + p.vx * 20;
        p.y = dynamicCy + Math.sin(p.angle) * p.baseRadius + p.vy * 20;

        // Mouse gentle repel
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        if (distToMouse < 140) {
          const force = (140 - distToMouse) / 140;
          p.x += (dx / distToMouse) * force * 18;
          p.y += (dy / distToMouse) * force * 18;
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${isDark ? 0.8 : 0.6})`;
        ctx.shadowColor = `rgba(${p.color}, 0.5)`;
        ctx.shadowBlur = isDark ? 8 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connecting edges within cluster
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (p.clusterIdx === p2.clusterIdx) {
            const edgeDx = p.x - p2.x;
            const edgeDy = p.y - p2.y;
            const edgeDist = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
            if (edgeDist < 85) {
              const alpha = (1 - edgeDist / 85) * (isDark ? 0.22 : 0.15);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(${p.color}, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-700">
      {/* Dynamic Clustering HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70 dark:opacity-60"
      />

      {/* Cyberpunk / Aurora Mesh Gradient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 sm:w-[520px] h-96 sm:h-[520px] rounded-full bg-cyan-500/12 dark:bg-cyan-500/10 blur-[130px] pointer-events-none transform-gpu" />
      <div className="absolute top-1/4 -right-32 w-96 sm:w-[600px] h-96 sm:h-[600px] rounded-full bg-purple-600/12 dark:bg-purple-600/10 blur-[140px] pointer-events-none transform-gpu" />
      <div className="absolute -bottom-32 left-1/3 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/8 blur-[130px] pointer-events-none transform-gpu" />

      {/* Modern Developer Dot Grid Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.18]"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)'
            : 'radial-gradient(rgba(15, 23, 42, 0.25) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
}
