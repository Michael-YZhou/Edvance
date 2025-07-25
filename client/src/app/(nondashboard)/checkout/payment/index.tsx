import React from "react";
import StripeProvider from "./StripeProvider";

const PaymentPageContent = () => {
  return <div>PaymentPageContent</div>;
};

const PaymentPage = () => {
  return (
    <StripeProvider>
      <PaymentPageContent />
    </StripeProvider>
  );
};

export default PaymentPage;
