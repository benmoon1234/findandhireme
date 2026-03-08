import { z } from "zod";
import { insertUserSchema, insertJobListingSchema, insertApplicationSchema, insertEmployerSchema, jobListings, users, applications, employers, savedJobs, blogPosts } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: "POST" as const,
      path: "/api/register" as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: "POST" as const,
      path: "/api/login" as const,
      input: z.object({ email: z.string().email(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout" as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/me" as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  jobs: {
    list: {
      method: "GET" as const,
      path: "/api/jobs" as const,
      responses: {
        200: z.array(z.custom<typeof jobListings.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/jobs/:id" as const,
      responses: {
        200: z.custom<typeof jobListings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/jobs" as const,
      input: insertJobListingSchema,
      responses: {
        201: z.custom<typeof jobListings.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/jobs/:id" as const,
      input: insertJobListingSchema.partial(),
      responses: {
        200: z.custom<typeof jobListings.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/jobs/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  employers: {
    list: {
      method: "GET" as const,
      path: "/api/employers" as const,
      responses: {
        200: z.array(z.custom<typeof employers.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/employers/:slug" as const,
      responses: {
        200: z.custom<typeof employers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/employers" as const,
      input: insertEmployerSchema,
      responses: {
        201: z.custom<typeof employers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  applications: {
    list: {
      method: "GET" as const,
      path: "/api/applications" as const,
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/applications" as const,
      input: insertApplicationSchema,
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  savedJobs: {
    list: {
      method: "GET" as const,
      path: "/api/saved-jobs" as const,
      responses: {
        200: z.array(z.custom<typeof savedJobs.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    save: {
      method: "POST" as const,
      path: "/api/saved-jobs" as const,
      input: z.object({ jobId: z.number() }),
      responses: {
        201: z.custom<typeof savedJobs.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    unsave: {
      method: "DELETE" as const,
      path: "/api/saved-jobs/:jobId" as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  blogPosts: {
    list: {
      method: "GET" as const,
      path: "/api/blog-posts" as const,
      responses: {
        200: z.array(z.custom<typeof blogPosts.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/blog-posts/:slug" as const,
      responses: {
        200: z.custom<typeof blogPosts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertJobListing = z.infer<typeof insertJobListingSchema>;
