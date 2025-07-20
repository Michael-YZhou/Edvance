"use client";

import React from "react";
import { SignUp, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useSearchParams } from "next/navigation";

const SignUpComponent = () => {
  // this is the user object from Clerk that we use to get the user's email
  const { user } = useUser();
  const searchParams = useSearchParams();
  // this is the url param that we use to check if the user is on the checkout page
  const isCheckoutPage = searchParams.get("showSignup") !== null;
  const courseId = searchParams.get("id");

  // if the user is on the checkout page, we let them stay on the checkout page
  // and signup use the signup component in the checkout page.
  // otherwise, we redirect them to the signup page
  const signInUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=false` // no need to change the signin component to signup component bacause user wants to signin
    : "/signin";

  // this is the function that we use to get the redirect url
  // if the user is on the checkout page, we keep them on the checkout page
  // otherwise, we redirect them to the courses page based on their user type
  const getRedirectUrl = () => {
    if (isCheckoutPage) {
      return `/checkout?step=2&id=${courseId}`;
    }
    const userType = user?.publicMetadata?.userType as string;
    if (userType === "teacher") {
      return "/teacher/courses";
    }
    return "/user/courses";
  };

  return (
    <SignUp
      appearance={{
        baseTheme: dark,
        elements: {
          rootBox: "flex justify-center items-center py-5",
          cardBox: "shadow-none",
          card: "bg-customgreys-secondarybg w-full shadow-none",
          footer: {
            background: "#25262F",
            padding: "0rem, 2.5rem",
            "& > div> div:nth-child(1)": {
              background: "#25262F",
            },
          },
          formFieldLabel: "text-white-50 form-normal",
          formButtonPrimary:
            "bg-primary-700 text-white-100 hover:bg-primary-600 !shadow-none",
          formFieldInput: "bg-customgreys-primarybg text-white-50 !shadow-none",
          footerActionLink: "text-primary-750 hover:text-primary-600",
        },
      }}
      signInUrl={signInUrl}
      forceRedirectUrl={getRedirectUrl()}
      routing="hash"
      afterSignOutUrl="/"
    />
  );
};

export default SignUpComponent;
