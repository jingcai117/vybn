import React from 'react';
import Modal from "react-native-modal";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

import AddSubscriptionView from '../../components/AddSubscriptionView';
import PaymentFormView from '../../components/PaymentFormView';

const STRIPE_ERROR = 'Payment service error. Try again later.';
const SERVER_ERROR = 'Server error. Try again later.';
const STRIPE_PUBLISHABLE_KEY = 'pk_live_Rkf7Sz0PuOnmcWLXg7twKH50005QCGloSn';

const getCreditCardToken = (creditCardData) => {
  const card = {
    'card[number]': creditCardData.values.number.replace(/ /g, ''),
    'card[exp_month]': creditCardData.values.expiry.split('/')[0],
    'card[exp_year]': creditCardData.values.expiry.split('/')[1],
    'card[cvc]': creditCardData.values.cvc
  };

  return fetch('https://api.stripe.com/v1/tokens', {
    headers: {
      // Use the correct MIME type for your server
      Accept: 'application/json',
      // Use the correct Content Type to send data to Stripe
      'Content-Type': 'application/x-www-form-urlencoded',
      // Use the Stripe publishable key as Bearer
      Authorization: `Bearer ${STRIPE_PUBLISHABLE_KEY}`
    },
    // Use a proper HTTP method
    method: 'post',
    // Format the credit card data to a string of key-value pairs
    // divided by &
    body: Object.keys(card)
      .map(key => key + '=' + card[key])
      .join('&')
  }).then(response => response.json());
};

const subscribeUser = (creditCardToken) => {
  return new Promise((resolve) => {
    console.log('Credit card token\n', creditCardToken);
    setTimeout(() => {
      resolve({ status: true });
    }, 1000)
  });
};

export default function ModalComponent(props) {
  const [card, setCard] = React.useState("");
  const [expiryYear, setExpiryYear] = React.useState("");
  const [expiryMonth, setExpiryMonth] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [err, setErr] = React.useState(false);
  const [customLoading, setCustomLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState(null)

  const [
    makePayment,
    { loading: mutationLoading, error: mutationError }
  ] = useMutation(MAKE_PAYMENT);

  const onSubmit = async (creditCardInput) => {
    // const { navigation } = this.props;
    
    setSubmitted(true);

    let creditCardToken;
    try {
      setCustomLoading(true);
      creditCardToken = await getCreditCardToken(creditCardInput);
      if (creditCardToken.error) {
        setSubmitted(false);
        setError(STRIPE_ERROR);
        setCustomLoading(false);
        return;
      }
    } catch (e) {
      setSubmitted(false);
      setError(STRIPE_ERROR);
      setCustomLoading(false);
      return;
    }

    setCustomLoading(true);
    if (creditCardToken.id) {
      let paymentResult = await makePayment({ variables: { token: creditCardToken.id } });
      console.log('payment result: ', paymentResult);
      setCustomLoading(false);

      if(paymentResult.data.makePayment) {
        props.refetch();
        props.showPaymentModal(false);
      }else {
        setError('Payment failed. Please try again later');
      }
    } else {
      setError(creditCardToken.error.message);
    }

    return;

    const { error } = await subscribeUser(creditCardToken);
    if (error) {
      setSubmitted(false);
      setError(SERVER_ERROR);
    } else {
      setSubmitted(false);
      setError(null);

      // navigation.navigate('Home')
    }
  };
  

  if (mutationLoading || customLoading) {
    return (
      <View>
        <Modal
          isVisible={true}
          onBackdropPress={() => props.showPaymentModal(false)}
        >
          <View style={{ flex: 1, justifyContent: "center" }}>
            <View style={{ backgroundColor: "white", margin: 10 }}>
              <View style={{ padding: 10 }}>
                <Text>Loading</Text>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View>
      <Modal
        isVisible={true}
        onBackdropPress={() => props.showPaymentModal(false)}
      >
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View style={{ backgroundColor: "white", margin: 10 }}>
            <View style={{ padding: 10 }}>
              <PaymentFormView 
                error={error}
                submitted={submitted}
                onSubmit={onSubmit}/>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const MAKE_PAYMENT = gql`
  mutation($token: String!) {
    makePayment(token: $token)
  }
`;
