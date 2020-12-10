import React, { Component } from 'react'
import locData from './data/locations'
import floorData from './data/floors'
import logo from './assets/logo.png'

function validate(username, building, floor){
  const errors = [];

  if(username.length === 0){
    errors.push("Username is required!");
  }
  if(building.length === 0){
    errors.push("Workplace is required!");
  }
  if(floor.length === 0){
    errors.push("Floor is required!");
  }
  return errors;
}

let search = window.location.search;
let params = new URLSearchParams(search);
const user = params.get('user');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      username: user || '',
      building: '',
      floor: '',
      remote: '',
      workingRemote: '',
      errors: [],
      j: '',
      redirectToReferrer: false
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const errors = validate(this.state.username, this.state.building, this.state.floor, this.state.remote, this.state.workingRemote);
    if(errors.length > 0){
      this.setState({ errors });
      alert(errors);
      return;
    }

    const get = [];

    fetch('http://b2pvapds0001:8082/crud/' + user)
      .then((response) => response.json())
      .then((data) => this.setState({ get:data }, function() {
        console.log(this.state.get.length)
        if(this.state.get.length) {
          fetch('http://b2pvapds0001:8082/crud', {
            method: 'put',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: this.state.username,
              building: this.state.building,
              floor: this.state.floor,
              remote: this.state.remote,
              workingRemote: this.state.workingRemote
            })
          })
            .then(response => response.json())
            .then(item => {
              if(Array.isArray(item)) {
                this.props.toggle()
              } else {
                console.log(data)
              }
            })
            .catch(err => console.log(err))
          } else {
            fetch('http://b2pvapds0001:8082/crud', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: this.state.username,
              building: this.state.building
            })
          })
            .then(response => response.json())
            .then(item => {
              if(Array.isArray(item)) {
                this.props.toggle()
              } else {
                console.log('failure')
              }
            })
            .catch(err => console.log(err))
          }
      }))

      this.setState({ redirectToReferrer: true })
  }

  render() {
    const { errors } = this.state
    if(user) {
      const redirectToReferrer = this.state.redirectToReferrer;

      if(redirectToReferrer === true) { return (
        <div className="App">
          <p><img src={logo} /></p>
            <label>
              Thank you!  Your workplace has been has been updated for the audit!
            </label>
        </div>
        )
      }

      return (
          <div className="App">
            <p><img src={logo} /></p>
            <div>
              <form action="#">
                <label>Please Select Your Primary Workplace</label>
                <select id="building" name="building" onChange={e => this.setState({building:e.target.value})}>
                  <option disabled selected value=''>---select---</option>
                    {  
                      locData.records
                        .sort((a,b) => a.full_name > b.full_name ? 1:-1)
                        .map((h, i) =>
                        (
                          <option key={i} value={h.sys_id}>{h.full_name} ({h.street}, {h.city}, {h.state} {h.zip})</option>
                        ))
                    }
                  </select>
                  <label>Please Select Your Floor</label>
                  <select id="floor" name="floor" onChange={e => this.setState({floor:e.target.value})}>
                    <option disabled selected value=''>---select---</option>
                    {
                      floorData.records
                        .sort((a,b) => a.name > b.name ? 1:-1)
                        .filter((floorData) => floorData.location == this.state.building)
                        .map(floorData =>
                        (
                          <option key={floorData.sys_id} value={floorData.name}>{floorData.name}</option>
                        ))
                    }
                    <option value="Main Floor">Main Floor (If Floor Not Listed)</option>
                  </select>
                  <div onChange={e => this.setState({remote:e.target.value})}>
                    <label>Are You a Remote Worker?</label>
                      <p>
                        <input type="radio" value="1" name="remote" /> Yes
                      </p>
                      <p>
                        <input type="radio" value="0" name="remote" /> No
                      </p>
                  </div>
                <div onChange={e => this.setState({workingRemote:e.target.value})}>
                  <label>Are You Currently Working Remotely?</label>
                    <p>
                      <input type="radio" value="1" name="workingRemote" /> Yes
                    </p>
                    <p>
                      <input type="radio" value="0" name="workingRemote" /> No
                    </p>
                  </div>
                <input type="submit" class="float-right" onClick={e => this.handleFormSubmit(e)} value="Submit" />
              </form>
            </div>
          </div>
      )
    } else {
      return (
        <div className="App">
            <p><img src={logo} /></p>
            <div>
            <label>Error 404: Page does not exist.</label>
            </div>
        </div>
      )
    }
  }
}

export default App