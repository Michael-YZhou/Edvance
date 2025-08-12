"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

/**
 * Custom hook to handle the checkout navigation
 * This hook is used to navigate to a specific step in the checkout process
 * It also ensures that the user is signed in before accessing the checkout page
 * @returns {Object} - An object containing the checkout step and the navigateToStep function
 */
export const useCheckoutNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useUser();

  // Get the course id from the url search params
  const courseId = searchParams.get("id") ?? "";
  // Get the current step from the url search params
  const checkoutStep = parseInt(searchParams.get("step") ?? "1", 10);

  /**
   * Navigate to a specific step in the checkout process
   * @param step - The step to navigate to (1-3)
   */
  const navigateToStep = useCallback(
    (step: number) => {
      const newStep = Math.min(Math.max(1, step), 3); // ensure step is between 1 and 3
      const showSignUp = isSignedIn ? "true" : "false";

      router.push(
        `/checkout?step=${newStep}&id=${courseId}&showSignUp=${showSignUp}`,
        { scroll: false }
      );
    },
    [courseId, isSignedIn, router]
  );

  // This step is to make sure the user is signed in before accessing the checkout page
  // Redirect to step 1 if user is not signed in and step is greater than 1
  // Put the code in a useEffect to trigger it after the component is mounted, and not on every render.
  useEffect(() => {
    if (isLoaded && !isSignedIn && checkoutStep > 1) {
      navigateToStep(1);
    }
  }, [checkoutStep, isLoaded, isSignedIn, navigateToStep]);

  // Return the checkout step and the navigateToStep function
  return { checkoutStep, navigateToStep };
};
