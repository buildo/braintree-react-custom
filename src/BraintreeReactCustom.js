import React from 'react';
import pure from 'revenge/lib/decorators/pure';
import { props, t } from 'tcomb-react';

const HostField = t.struct({
  selector: t.String,
  placeholder: t.maybe(t.String)
});

const Configuration = t.struct({
  id: t.String,
  hostedFields: t.struct({
    number: HostField,
    cvv: HostField,
    expirationDate: HostField
  }),
  paypal: t.Object
}, 'Configuration');

@pure
@props({
  braintree: t.Object,
  clientToken: t.String,
  configuration: Configuration,
  form: t.ReactChild,
  onReady: t.maybe(t.Function),
  onPaymentMethodReceived: t.Function,
  onError: t.maybe(t.Function)
}, { strict: false })
export default class BraintreeForm extends React.Component {

  static defaultProps = {
    onReady: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      error: {
        type: null,
        message: null
      }
    };
  }

  componentDidMount() {
    const { configuration } = this.props;
    const braintreeFormContainer = React.findDOMNode(this.refs.braintreeFormContainer);
    const formHTML = React.renderToStaticMarkup(this.props.form);
    braintreeFormContainer.innerHTML = formHTML;

    ['number', 'cvv', 'expirationDate'].forEach((k) => {
      if (!document.body.querySelector(configuration.hostedFields[k].selector)) {
        /* eslint-disable no-console */
        console.error(`no ${configuration.hostedFields[k].selector} found.`);
        /* eslint-enable no-console */
      }
    });
    const setupConfigurations = {
      onReady: this.props.onReady,
      onPaymentMethodReceived: this.props.onPaymentMethodReceived,
      onError: this.props.onError,
      ...configuration
    };
    this.props.braintree.setup(this.props.clientToken, 'custom', setupConfigurations);
  }

  render() {
    return (
      <div ref='braintreeFormContainer' />
    );
  }
}
