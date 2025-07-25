"use client";

import React from "react";
import Loading from "@/components/loading";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { useSearchParams } from "next/navigation";

const CheckoutDetails = () => {
  const { course: selectedCourse, isLoading, isError } = useCurrentCourse();
  // Determine if the user should be shown the sign up form or the sign in form based on the showSignUp parameter
  const searchParams = useSearchParams();
  const showSignUp = searchParams.get("showSignUp") === "true";

  if (isLoading) return <Loading />;
  if (isError) return <div>Failed to fetch course data</div>;
  if (!selectedCourse) return <div>Course not found</div>;

  return <div>CheckoutDetails</div>;
};

export default CheckoutDetails;
