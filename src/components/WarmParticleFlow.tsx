import { useEffect, useRef } from 'react';
import p5 from 'p5';

interface WarmParticleFlowProps {
  className?: string;
}

export default function WarmParticleFlow({ className = '' }: WarmParticleFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current || p5Ref.current) return;

    const sketch = (p: p5) => {
      const isMobile = window.innerWidth < 768;
      const PARTICLE_COUNT = isMobile ? 800 : 2500;
      const INTERACTION_RADIUS = isMobile ? 120 : 180;

      class WarmEmber {
        pos: p5.Vector;
        vel: p5.Vector;
        acc: p5.Vector;
        size: number;
        hue: number;
        sat: number;
        bri: number;
        lifespan: number;
        maxLifespan: number;
        decay: number;
        wanderOffset: number;
        brightnessPulse: number;

        constructor() {
          this.pos = p.createVector(0, 0);
          this.vel = p.createVector(0, 0);
          this.acc = p.createVector(0, 0);
          this.size = 2;
          this.hue = 30;
          this.sat = 75;
          this.bri = 90;
          this.lifespan = 300;
          this.maxLifespan = 300;
          this.decay = 1;
          this.wanderOffset = 0;
          this.brightnessPulse = 0;
        }

        respawn(w: number, h: number) {
          this.pos = p.createVector(p.random(w), p.random(h * 0.4, h + 50));
          this.vel = p.createVector(0, 0);
          this.acc = p.createVector(0, 0);
          this.hue = p.random(15, 45);
          this.sat = p.random(60, 90);
          this.bri = p.random(80, 100);
          this.size = p.random(1, 4);
          this.maxLifespan = p.random(180, 400);
          this.lifespan = this.maxLifespan;
          this.decay = p.random(0.5, 1.5);
          this.brightnessPulse = p.random(p.TWO_PI);
        }

        update(mousePos: p5.Vector, mouseActive: boolean): boolean {
          // Rise force
          const riseForce = p.createVector(0, p.map(this.size, 1, 4, -0.8, -0.2));
          this.acc.add(riseForce);

          // Wander
          const noiseScale = 0.008;
          this.wanderOffset += 0.02;
          const n = p.noise(this.pos.x * noiseScale, this.pos.y * noiseScale, this.wanderOffset);
          const angle = p.map(n, 0, 1, -p.PI, p.PI);
          const wander = p5.Vector.fromAngle(angle).mult(0.08);
          this.acc.add(wander);

          // Mouse repulsion
          if (mouseActive) {
            const dir = p5.Vector.sub(this.pos, mousePos);
            const dist = dir.mag();
            if (dist < INTERACTION_RADIUS && dist > 0) {
              dir.normalize();
              dir.mult(2.5 * (1 - dist / INTERACTION_RADIUS));
              this.acc.add(dir);
            } else if (dist === 0) {
              this.acc.add(p.createVector(p.random(-1, 1), p.random(-1, 1)));
            }
          }

          // Physics
          this.vel.add(this.acc);
          this.vel.limit(3);
          this.pos.add(this.vel);
          this.acc.mult(0);

          // Brightness pulse
          this.brightnessPulse += 0.03;

          // Age
          this.lifespan -= this.decay;

          return this.lifespan <= 0 || this.pos.y < -50;
        }

        draw(p: p5): number {
          const alpha = p.map(this.lifespan, 0, this.maxLifespan, 0, 0.9);
          const pulse = p.sin(this.brightnessPulse) * 5;
          const c = p.color(this.hue, this.sat, this.bri + pulse);

          // Glow layer
          p.noStroke();
          p.fill(p.hue(c), p.saturation(c), p.brightness(c), alpha * 0.15);
          p.circle(this.pos.x, this.pos.y, this.size * 8);

          // Main body
          p.fill(p.hue(c), p.saturation(c), p.brightness(c), alpha * 0.7);
          p.circle(this.pos.x, this.pos.y, this.size * 2);

          // Bright core
          if (this.bri > 85 && this.size > 2) {
            p.fill(30, 20, 100, alpha * 0.9);
            p.circle(this.pos.x, this.pos.y, this.size * 0.8);
          }

          return alpha;
        }
      }

      let particles: WarmEmber[] = [];
      let mousePos: p5.Vector;
      let mouseActive = false;

      p.setup = () => {
        const w = containerRef.current?.clientWidth || window.innerWidth;
        const h = containerRef.current?.clientHeight || window.innerHeight;
        p.createCanvas(w, h);
        p.colorMode(p.HSB, 360, 100, 100, 1);
        p.frameRate(60);
        p.smooth();

        mousePos = p.createVector(-1000, -1000);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const ember = new WarmEmber();
          ember.respawn(w, h);
          particles.push(ember);
        }
      };

      p.draw = () => {
        p.background(30, 80, 100, 0.15);

        for (const particle of particles) {
          const isDead = particle.update(mousePos, mouseActive);
          if (isDead) {
            particle.respawn(p.width, p.height + 50);
            particle.draw(p);
          } else {
            const alpha = particle.draw(p);
            if (alpha < 0.05) {
              particle.respawn(p.width, p.height + 50);
            }
          }
        }
      };

      p.mouseMoved = () => {
        mouseActive = true;
        mousePos.set(p.mouseX, p.mouseY);
      };

      (p as any).mouseOut = () => {
        mouseActive = false;
      };

      p.windowResized = () => {
        const w = containerRef.current?.clientWidth || window.innerWidth;
        const h = containerRef.current?.clientHeight || window.innerHeight;
        p.resizeCanvas(w, h);
      };
    };

    p5Ref.current = new p5(sketch, containerRef.current);

    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-0 ${className}`}
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}
