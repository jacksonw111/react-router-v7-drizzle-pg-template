import { type ActionFunctionArgs } from "react-router";
import { auth } from "~/lib/auth";
import { db } from "~/db";
import { user as userTable } from "~/db/schemas/auth-schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  email: z.string().email("Invalid email format").optional(),
  name: z.string().min(1, "Name is required").optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check admin permissions - verify user has admin role
    const userData = await db.select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (!userData[0] || userData[0].role !== "admin") {
      return Response.json(
        { error: "Admin permissions required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Update user in database
    const { userId, email, name } = validatedData;
    
    const updates: Record<string, string> = {};
    if (email !== undefined) updates.email = email;
    if (name !== undefined) updates.name = name;

    if (Object.keys(updates).length === 0) {
      return Response.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    // Update user using Drizzle ORM
    const [updatedUser] = await db.update(userTable)
      .set(updates)
      .where(eq(userTable.id, userId))
      .returning();

    if (!updatedUser) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating user:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}