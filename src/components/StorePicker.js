import React from 'react';
import { getFunName } from '../helpers';
import { PropTypes } from 'prop-types';

class StorePicker extends React.Component {
  goToStore(event){
    event.preventDefault();
    // grab text from the box
    const storeId = this.storeInput.value;
    // go to url /store/:storeId
    this.context.router.transitionTo(`/store/${storeId}`);
  }

  render() {
    return (
      <form className="store-selector" onSubmit={ (e) => this.goToStore(e)}>
        <h2>Please Enter a Store</h2>
        <input type="text" required placeholder="Store Name" defaultValue={getFunName()} ref={(input) => { this.storeInput = input }}/>
        <button type="submit">Visit Store →</button>
        <a href="/store/repulsive-beautiful-criteria">Test Store</a>
      </form>
    )
  }
}

StorePicker.contextTypes = {
  router: PropTypes.object
}

export default StorePicker;
