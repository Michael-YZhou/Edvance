import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import { User } from "@clerk/nextjs/server";
import { toast } from "sonner";
// import { Clerk } from "@clerk/clerk-js";

/*
 * This is a custom base query that is used to handle the error and success messages
 * Instead of fetchBaseQuery, this API slice uses this custom handler,
 * so every endpoint automatically benefits from the standardized response and error logic.
 */
const customBaseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: any
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await window.Clerk?.session?.getToken(); // get the token from the currently active clerk session
      if (token) {
        headers.set("Authorization", `Bearer ${token}`); // set the token in the headers for every request
      }
      return headers;
    },
  });

  try {
    // this is the default base query, can be replaced with fetchBaseQuery or custom Axios query function if needed
    const result: any = await baseQuery(args, api, extraOptions);

    if (result.error) {
      const errorData = result.error.data;
      const errorMessage =
        errorData?.message ||
        result.error.status.toString() ||
        "An unknown error occurred";
      toast.error(`Error: ${errorMessage}`);
    }

    // only show the success message for mutation requests
    const isMutationRequest =
      (args as FetchArgs).method && (args as FetchArgs).method !== "GET";

    if (isMutationRequest) {
      const successMessage = result.data?.message;
      if (successMessage) toast.success(successMessage);
    }

    // if success, unwraps the data from the result
    if (result.data) {
      result.data = result.data.data;
    } else if (
      // if the response is 204 or 24 (no content), return null
      result.error?.status === 204 ||
      result.meta?.response.status === 24
    ) {
      return { data: null };
    }
    return result;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    // if error, return the custom error message
    return { error: { status: "FETCH_ERROR", error: errorMessage } };
  }
};

export const api = createApi({
  // baseQuery: fetchBaseQuery({
  //   baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  // }), // if you want to use the default base query
  baseQuery: customBaseQuery, // this is the custom base query used across all endpoints
  reducerPath: "api",
  tagTypes: ["Courses", "Users"],
  endpoints: (builder) => ({
    updateUser: builder.mutation<User, Partial<User> & { userId: string }>({
      query: ({ userId, ...userData }) => ({
        url: `users/clerk/${userId}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    getCourses: builder.query<Course[], { category?: string }>({
      query: ({ category }) => ({
        url: "courses",
        params: { category },
      }),
      providesTags: ["Courses"],
    }),
    getCourse: builder.query<Course, string>({
      query: (id) => ({
        url: `courses/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Courses", id }],
    }),
    // This endpoint takes the price and returns the client secret for the frontend to use in the stripe provider component
    createStripePaymentIntent: builder.mutation<
      { clientSecret: string },
      { amount: number }
    >({
      query: ({ amount }) => ({
        url: `/transactions/stripe/payment-intent`,
        method: "POST",
        body: { amount },
      }),
    }),
    createTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      query: (transaction) => ({
        url: `transactions`,
        method: "POST",
        body: transaction,
      }),
    }),
  }),
});

export const {
  useUpdateUserMutation,
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateStripePaymentIntentMutation,
  useCreateTransactionMutation,
} = api;
