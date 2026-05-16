import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Notes API",
      description:
        "A production-ready multi-user Notes API with JWT authentication, full CRUD, granular sharing permissions, pinning, full-text search, and pagination.",
      version: "1.0.0",
      contact: {
        name: "Pranjal Kumar Verma",
        email: "pranjalkumarverma18@gmail.com",
      },
    },
    servers: [
      { url: "http://localhost:5000", description: "Local Development" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from /login",
        },
      },
      schemas: {
        Note: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            title: { type: "string", example: "My First Note" },
            content: { type: "string", example: "This is the note body." },
            owner: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d01" },
            isPinned: { type: "boolean", example: false },
            sharedWith: {
              type: "array",
              items: { type: "string" },
              example: [],
            },
            tags: {
              type: "array",
              items: { type: "string" },
              example: ["work", "important"],
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-05-16T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-05-16T10:00:00.000Z",
            },
          },
        },
        PaginatedNotes: {
          type: "object",
          properties: {
            currentPage: { type: "integer", example: 1 },
            totalPages: { type: "integer", example: 3 },
            totalNotes: { type: "integer", example: 25 },
            notes: {
              type: "array",
              items: { $ref: "#/components/schemas/Note" },
            },
          },
        },
        SearchResults: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            count: { type: "integer", example: 2 },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Note" },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error description" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
