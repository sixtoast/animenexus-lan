/**
 * Lightweight kinematic physics for the habitat.
 * Swap body integration for Rapier later without changing callers.
 */

export type PhysicsBody = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  onGround: boolean;
};

export const GRAVITY = -9.5;
export const FLOOR_Y = 0;
export const BOUNCE = 0.28;
export const FRICTION = 0.86;

export function createBody(x = 0, z = 0): PhysicsBody {
  return { x, y: 0, z, vx: 0, vy: 0, vz: 0, onGround: true };
}

export function stepPhysics(body: PhysicsBody, dt: number): PhysicsBody {
  const b = { ...body };
  if (!b.onGround) {
    b.vy += GRAVITY * dt;
  }
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  b.z += b.vz * dt;

  // Floor collision
  if (b.y <= FLOOR_Y) {
    b.y = FLOOR_Y;
    if (b.vy < -0.4) {
      b.vy = -b.vy * BOUNCE;
      b.onGround = false;
      if (Math.abs(b.vy) < 0.35) {
        b.vy = 0;
        b.onGround = true;
      }
    } else {
      b.vy = 0;
      b.onGround = true;
    }
    b.vx *= FRICTION;
    b.vz *= FRICTION;
  }

  if (b.onGround) {
    b.vx *= 0.92;
    b.vz *= 0.92;
    if (Math.hypot(b.vx, b.vz) < 0.02) {
      b.vx = 0;
      b.vz = 0;
    }
  }

  return b;
}

export function applyJump(body: PhysicsBody, strength = 3.2): PhysicsBody {
  if (!body.onGround) return body;
  return {
    ...body,
    vy: strength,
    onGround: false,
  };
}

/** Impulse toward a point on the floor (walk assist). */
export function steerToward(
  body: PhysicsBody,
  tx: number,
  tz: number,
  speed: number,
  dt: number,
): PhysicsBody {
  const dx = tx - body.x;
  const dz = tz - body.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.03) {
    return { ...body, vx: body.vx * 0.5, vz: body.vz * 0.5 };
  }
  const ax = (dx / d) * speed;
  const az = (dz / d) * speed;
  return {
    ...body,
    vx: body.vx * 0.7 + ax * 0.3,
    vz: body.vz * 0.7 + az * 0.3,
    // keep y from physics
  };
}
