import { z } from "zod";
export declare const createEventSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        categoryId: z.ZodUUID;
        bannerUrl: z.ZodOptional<z.ZodURL>;
        date: z.ZodISODate;
        startTime: z.ZodISODateTime;
        endTime: z.ZodISODateTime;
        seatingType: z.ZodEnum<{
            BLOCK: "BLOCK";
            GENERAL: "GENERAL";
        }>;
        ticketTypes: z.ZodArray<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            price: z.ZodNumber;
            total: z.ZodNumber;
        }, z.core.$strip>>;
        venue: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            address: z.ZodString;
            district: z.ZodString;
            googleMaps: z.ZodOptional<z.ZodURL>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type EventInput = z.infer<typeof createEventSchema>["body"];
export declare const listEventsSchema: z.ZodObject<{
    query: z.ZodObject<{
        categoryId: z.ZodOptional<z.ZodUUID>;
        date: z.ZodOptional<z.ZodISODate>;
        district: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ListEventsQuery = z.infer<typeof listEventsSchema>["query"];
export declare const eventIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodUUID;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const eventSlugParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateEventSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodUUID;
    }, z.core.$strip>;
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        categoryId: z.ZodOptional<z.ZodUUID>;
        bannerUrl: z.ZodNullable<z.ZodOptional<z.ZodURL>>;
        date: z.ZodOptional<z.ZodISODate>;
        startTime: z.ZodOptional<z.ZodISODateTime>;
        endTime: z.ZodNullable<z.ZodOptional<z.ZodISODateTime>>;
        status: z.ZodOptional<z.ZodEnum<{
            CANCELLED: "CANCELLED";
            COMPLETED: "COMPLETED";
            DRAFT: "DRAFT";
            PUBLISHED: "PUBLISHED";
        }>>;
        venue: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            address: z.ZodString;
            district: z.ZodString;
            googleMaps: z.ZodNullable<z.ZodOptional<z.ZodURL>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>["body"];
export declare const deleteEventSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodUUID;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=event.schema.d.ts.map