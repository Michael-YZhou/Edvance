"use client";

import React from "react";
import Loading from "@/components/loading";
import { useUser } from "@clerk/nextjs";
import WizardStepper from "@/components/wizard-stepper";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import CheckoutDetails from "./checkout-details";
import PaymentPage from "./payment";
import CompletionPage from "./completion";

/**
 * Checkout Wizard component
 * This component is used to render the checkout wizard
 * It uses the useCheckoutNavigation hook to get the current step and navigate to the next step
 * It also renders the step component based on the current step
 */
const CheckoutWizard = () => {
  const { isLoaded } = useUser();
  const { checkoutStep } = useCheckoutNavigation();

  // this function retuen the steps we are on in the checkout process
  // 1. Checkout details page
  // 2. Payment page
  // 3. Completion page
  const renderStep = (checkoutStep: number) => {
    switch (checkoutStep) {
      case 1:
        return <CheckoutDetails />;
      case 2:
        return <PaymentPage />;
      case 3:
        return <CompletionPage />;
      default:
        return <CheckoutDetails />;
    }
  };

  if (!isLoaded) return <Loading />;
  return (
    <div className="checkout">
      <WizardStepper currentStep={checkoutStep} />
      <div className="checkout__content">{renderStep(checkoutStep)}</div>
    </div>
  );
};

export default CheckoutWizard;
