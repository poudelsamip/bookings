import { z } from "zod";

const venueSchema = z
    .object({
        name: z.string().trim().min(1, "Venue name is required").max(150),
        address: z.string().trim().min(1, "Venue address is required").max(300),
        district: z.string().trim().min(1, "District is required").max(100),
        googleMaps: z.url("Invalid Google Maps URL").optional(),
    })
    .optional();

const ticketTypesSchema = z
    .array(
        z.object({
            name: z
                .string()
                .min(1, "Block/Section name is required")
                .optional(),
            price: z.number().min(0),
            total: z.number().positive("Capacity must be at least 1"),
        }),
    )
    .min(1, "At least one ticket type is required");

export const createEventSchema = z.object({
    body: z
        .object({
            title: z
                .string()
                .trim()
                .min(1, "Event title is required")
                .max(100, "Event title must be at most 100 characters"),

            description: z
                .string()
                .trim()
                .min(1, "Event description is required")
                .max(1000, "Event description must be at most 1000 characters"),

            categoryId: z.uuid("Invalid category ID"),

            bannerUrl: z.url("Invalid banner URL").optional(),

            date: z.iso.date("Invalid event date"),
            startTime: z.iso.datetime(),
            endTime: z.iso.datetime(),

            seatingType: z.enum(["GENERAL", "BLOCK"]),

            ticketTypes: ticketTypesSchema,

            venue: venueSchema,
        })
        .superRefine((data, ctx) => {
            const { seatingType, ticketTypes } = data;

            if (seatingType === "GENERAL") {
                if (ticketTypes.length !== 1) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["ticketTypes"],
                        message:
                            "A event with seating type GENERAL must have exactly one ticket type",
                    });
                }
                return;
            }

            ticketTypes.forEach((t, i) => {
                if (!t.name) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["ticketTypes", i, "name"],
                        message: "Block name is requried",
                    });
                }
            });
        }),
});

export type EventInput = z.infer<typeof createEventSchema>["body"];

export const listEventsSchema = z.object({
    query: z.object({
        categoryId: z.uuid("Invalid category ID").optional(),
        date: z.iso.date("Invalid date").optional(),
        district: z.string().trim().optional(),
        search: z.string().trim().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    }),
});

export type ListEventsQuery = z.infer<typeof listEventsSchema>["query"];

export const eventIdParamSchema = z.object({
    params: z.object({
        id: z.uuid("Invalid event ID"),
    }),
});

export const eventSlugParamSchema = z.object({
    params: z.object({
        slug: z.string().trim().min(1, "Event slug is required"),
    }),
});

export const updateEventSchema = z.object({
    params: z.object({
        id: z.uuid("Invalid event ID"),
    }),
    body: z.object({
        title: z
            .string()
            .trim()
            .min(1, "Event title cannot be empty")
            .max(100, "Event title must be at most 100 characters")
            .optional(),

        description: z
            .string()
            .trim()
            .min(1, "Event description cannot be empty")
            .max(1000, "Event description must be at most 1000 characters")
            .optional(),

        categoryId: z.uuid("Invalid category ID").optional(),

        bannerUrl: z.url("Invalid banner URL").optional().nullable(),

        date: z.iso.date("Invalid event date").optional(),
        startTime: z.iso.datetime().optional(),
        endTime: z.iso.datetime().optional().nullable(),

        status: z
            .enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"])
            .optional(),

        venue: z
            .object({
                name: z
                    .string()
                    .trim()
                    .min(1, "Venue name is required")
                    .max(150),
                address: z
                    .string()
                    .trim()
                    .min(1, "Venue address is required")
                    .max(300),
                district: z
                    .string()
                    .trim()
                    .min(1, "District is required")
                    .max(100),
                googleMaps: z
                    .url("Invalid Google Maps URL")
                    .optional()
                    .nullable(),
            })
            .optional(),
    }),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>["body"];

export const deleteEventSchema = eventIdParamSchema;
