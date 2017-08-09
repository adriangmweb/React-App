import React from 'react';
import { PropTypes } from 'prop-types';
import AddFishForm from './AddFishForm'
import base from '../base';

class Inventory extends React.Component{
  constructor() {
    super();
    this.renderInventory = this.renderInventory.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderLogin = this.renderLogin.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.logout = this.logout.bind(this);
    this.authHandeler = this.authHandeler.bind(this);
    this.state = {
      uid: null,
      owner: null
    }
  }

  componentDidMount() {
    base.onAuth((user) =>{
      if(user) {
        this.authHandeler(null, { user });
      }
    });
  }

  handleChange(e, key){
    const fish = this.props.fishes[key];
    // take a copy of that fish and update it with the new data
    const updatedFish = {
      ...fish,
      [e.target.name]: e.target.value
    }
    this.props.updateFish(key, updatedFish);
  }

  authenticate(provider) {
    console.log(`trying to log with ${provider}`);
    base.authWithOAuthPopup(provider, this.authHandeler);
  }

  logout() {
    base.unauth();
    this.setState({ uid: null });
  }

  authHandeler(err, authData) {
    if (err) {
      console.log(err);
      return;
    }

    // grab the store info
    const storeRef = base.database().ref(this.props.storeId);

    // query the firebase once for the store data
    storeRef.once('value', (snapshot) => {
      const data = snapshot.val() || {};

      // claim it for the current user if there is no owner already
      if(!data.owner) {
        storeRef.set({
          owner: authData.user.uid
        });
      }

      this.setState({
        uid: authData.user.uid,
        owner: data.owner || authData.user.uid
      })
    });
  }

  renderLogin(){
    return(
      <nav className="login">
        <p>Sign in to make your store's inventory</p>
        <button className="github" onClick={() => this.authenticate('github')}>Log In with Github</button>
        <button className="facebook" onClick={() => this.authenticate('facebook')}>Log In with Facebook</button>
        <button className="twitter" onClick={() => this.authenticate('twitter')}>Log In with Twitter</button>
      </nav>
    )
  }

  renderInventory(key) {
    const fish = this.props.fishes[key];
    return (
      <div className="fish-edit" key={key}>
        <input value={fish.name} name="name" type="text" placeholder="Fish Name" onChange={(e) => this.handleChange(e, key)}/>
        <input value={fish.price} name="price" type="text" placeholder="Fish Price" onChange={(e) => this.handleChange(e, key)}/>
        <select value={fish.status} name="status" onChange={(e) => this.handleChange(e, key)}>
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>
        <textarea value={fish.desc} name="desc" placeholder="Fish Desc" onChange={(e) => this.handleChange(e, key)}></textarea>
        <input value={fish.image} type="text" name="image" placeholder="Fish Image" onChange={(e) => this.handleChange(e, key)}/>
        <button onClick={() => this.props.removeFish(key)}>Remove Fish</button>
      </div>
    )
  }
  render(){
    const logout = <button onClick={this.logout}>Log Out!</button>;

    // check if the user is not logged in at all
    if(!this.state.uid) {
      return <div>{this.renderLogin()}</div>
    }

    // Check if the user is the owner of the current store
    if(this.state.uid !== this.state.owner) {
      return(
        <div>
          <p>Sorry you aren't the owner of this store!</p>
          {logout}
        </div>
      )
    }
    return(
      <div>
        <h2>Inventory</h2>
        {logout}
        {Object.keys(this.props.fishes).map(this.renderInventory)}
        <AddFishForm addFish={this.props.addFish}/>
        <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
      </div>
    )
  }
}

Inventory.propTypes = {
  fishes: PropTypes.object.isRequired,
  updateFish: PropTypes.func.isRequired,
  removeFish: PropTypes.func.isRequired,
  addFish: PropTypes.func.isRequired,
  loadSamples: PropTypes.func.isRequired,
  storeId: PropTypes.string.isRequired
}

export default Inventory;
