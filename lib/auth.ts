
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const mongoUri = process.env.MONGO_DB_URL;

if (!mongoUri) {
  throw new Error("MONGODB_URI is missing from environment variables");
}

const toOrigin = (value?: string) => {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const localOrigin = "http://localhost:3000";
const productionOrigin = "https://rental-client-wine.vercel.app";

const configuredUrl = process.env.BETTER_AUTH_URL || localOrigin;
const authOrigin = toOrigin(configuredUrl) || localOrigin;

const trustedOrigins = Array.from(
  new Set(
    [
      localOrigin,
      productionOrigin,
      authOrigin,
      toOrigin(process.env.FRONTEND_URL),
      toOrigin(process.env.NEXT_PUBLIC_API_URL),
    ].filter((value): value is string => Boolean(value))
  )
);

const client = new MongoClient(mongoUri);

const db = client.db("equipment_rental");

export const auth = betterAuth({
  baseURL: authOrigin,
  trustedOrigins,
  database: mongodbAdapter(db, {
    client,
  }),

   user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
},

    plugins: [
    jwt({
      jwt: {
        issuer: authOrigin,
        audience: authOrigin,
        expirationTime: "15m",
      },
    }),
  ],
});
