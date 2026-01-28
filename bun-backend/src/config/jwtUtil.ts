import { SignJWT, jwtVerify } from "jose";
import { config } from "./appConfig";

//encode secret key
const SECRET_KEY = new TextEncoder().encode(config.jwt.secret);

export async function signToken(userId: number): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.jwt.expiration) // Pake config
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<{ userId: number }> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return { userId: Number(payload.userId) };
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}