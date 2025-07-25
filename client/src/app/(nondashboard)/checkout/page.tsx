import React from "react";
import Loading from "@/components/loading";
import { useUser } from "@clerk/nextjs";
import WizardStepper from "@/components/wizard-step";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";

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
        // return <CheckoutDetails />;
        return <div>Checkout Details</div>;
      case 2:
        // return <Payment />;
        return <div>Payment</div>;
      case 3:
        // return <Completion />;
        return <div>Completion</div>;
      default:
        return <div>Checkout Details</div>;
    }
  };

  if (!isLoaded) return <Loading />;
  return (
    <div className="checkout">
      <WizardStepper currentStep={checkoutStep} />
      <div className="checkout__content">{renderStep(1)}</div>
    </div>
  );
};

export default CheckoutWizard;
