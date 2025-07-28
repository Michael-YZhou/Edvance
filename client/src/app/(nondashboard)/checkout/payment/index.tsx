import React from "react";
import StripeProvider from "./StripeProvider";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { useClerk, useUser } from "@clerk/nextjs";
import CoursePreview from "@/components/course-preview";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTransactionMutation } from "@/state/api";
import { toast } from "sonner";

const PaymentPageContent = () => {
  // this is the stripe object that we use to interact with the stripe api
  // we use this to create a payment method and confirm the payment
  // they are only available when we wrap the stripe provider component around the payment page
  const stripe = useStripe();
  const elements = useElements();
  const [createTransaction] = useCreateTransactionMutation();
  const { navigateToStep } = useCheckoutNavigation();
  const { course, courseId } = useCurrentCourse();
  const { user } = useUser();
  const { signOut } = useClerk();

  /**
   * Handles the submission of the payment form.
   * @param e - The form event.
   * @returns void
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast.error("Stripe payment service is not available");
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_STRIPE_REDIRECT_URL}?id=${courseId}`,
      },
      redirect: "if_required",
    });
    if (result.paymentIntent?.status === "succeeded") {
      const transactionData: Partial<Transaction> = {
        userId: user?.id,
        courseId,
        transactionId: result.paymentIntent.id,
        amount: course?.price || 0,
        paymentProvider: "stripe",
      };
      // create the transaction in the database
      const { data, error } = await createTransaction(transactionData);
      if (error) {
        toast.error("Failed to create Stripe transaction");
      }
      if (data) {
        toast.success("Stripe transaction created successfully");
        // navigate to the checkout completion step (step 3)
        navigateToStep(3);
      }
    }
  };

  if (!course) return null;

  return (
    <div className="payment">
      <div className="payment__container">
        {/* Order Summary */}
        <div className="payment__preview">
          <CoursePreview course={course} />
        </div>
        {/* Payment Form */}
        <div className="payment__form-container">
          <form
            id="payment-form"
            className="payment__form"
            onSubmit={handleSubmit}
          >
            <div className="payment__content">
              <h1 className="payment__title">Checkout</h1>
              <p className="payment__subtitle">
                Fill out the payment details to complete your purchase.
              </p>

              <div className="payment__method">
                <h3 className="payment__method-title">Payment Method</h3>
                <div className="payment__card-container">
                  <div className="payment__card-header">
                    <CreditCard size={24} />
                    <span>Credit/Debit Card</span>
                  </div>
                  <div className="payment__card-element">
                    <PaymentElement />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* Navigation Buttons */}
      <div className="payment__actions">
        <Button
          className="bg-transparent hover:bg-white-50/10 hover:text-white-50"
          // onClick={handleSignOutandNavigate}
          variant="outline"
          type="button"
        >
          Switch Account
        </Button>

        <Button
          className="payment__submit hover:bg-primary-600"
          form="payment-form"
          type="submit"
          disabled={!stripe || !elements}
        >
          Pay with Credit Card
        </Button>
      </div>
    </div>
  );
};

const PaymentPage = () => {
  return (
    <StripeProvider>
      <PaymentPageContent />
    </StripeProvider>
  );
};

export default PaymentPage;
